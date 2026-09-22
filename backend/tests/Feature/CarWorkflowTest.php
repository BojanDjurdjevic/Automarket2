<?php

namespace Tests\Feature;

use App\Models\{BodyType, Car, CarMake, CarModel, Feature, FuelType, Transmission, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\{DB, Storage};
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class CarWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function car(array $attributes = []): Car
    {
        $make = CarMake::firstOrCreate(['name' => 'Test Make']);
        $model = CarModel::firstOrCreate(['name' => 'Test Model', 'make_id' => $make->id]);

        return Car::create(array_merge([
            'user_id' => User::factory()->create()->id,
            'make_id' => $make->id,
            'model_id' => $model->id,
            'fuel_type_id' => FuelType::firstOrCreate(['name' => 'Petrol'])->id,
            'body_type_id' => BodyType::firstOrCreate(['name' => 'Sedan'])->id,
            'transmission_id' => Transmission::firstOrCreate(['name' => 'Manual'])->id,
            'title' => 'Roadster', 'year' => 2020, 'price' => 10000,
            'mileage' => 0, 'location' => 'Belgrade',
            'slug' => fake()->unique()->slug(), 'status' => 'active',
        ], $attributes));
    }

    private function payload(Car $car): array
    {
        return $car->only(['make_id', 'model_id', 'fuel_type_id', 'body_type_id',
            'transmission_id', 'title', 'year', 'price', 'mileage', 'location']);
    }

    public function test_search_combines_relationship_filters_ranges_and_sorting(): void
    {
        $car = $this->car();
        $this->car(['title' => 'Unrelated', 'price' => 20000, 'mileage' => 500]);
        $otherMake = CarMake::create(['name' => 'Other Make']);
        $this->car(['make_id' => $otherMake->id]);
        $query = array_merge($car->only(['make_id', 'model_id', 'fuel_type_id', 'body_type_id', 'transmission_id']), [
            'search' => 'Road', 'price_min' => '10000', 'price_max' => '10000',
            'year_min' => '2020', 'year_max' => '2020', 'mileage_max' => '0',
            'sort_by' => 'price', 'sort_dir' => 'asc',
        ]);

        $this->getJson('/api/cars?'.http_build_query($query))
            ->assertOk()->assertJsonPath('data.0.id', $car->id)->assertJsonCount(1, 'data');
        $this->getJson('/api/cars?price_max=0')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/cars?search=Unrelated')->assertJsonCount(1, 'data');
        $this->getJson('/api/cars?search=Other%20Make')->assertJsonCount(1, 'data');
        $this->getJson('/api/cars?search=Test%20Model')->assertJsonCount(3, 'data');
    }

    public function test_zero_search_and_empty_filters_are_not_confused(): void
    {
        $car = $this->car(['title' => 'Model 0']);
        $this->car(['title' => 'Roadster']);

        $this->getJson('/api/cars?search=0&make_id=&price_max=')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $car->id);
        $this->getJson('/api/cars?search=&mileage_max=&sort_by=&sort_dir=')
            ->assertOk()->assertJsonCount(2, 'data');
    }

    public static function referenceFilters(): array
    {
        return [['make_id', CarMake::class], ['model_id', CarModel::class],
            ['fuel_type_id', FuelType::class], ['body_type_id', BodyType::class],
            ['transmission_id', Transmission::class]];
    }

    #[DataProvider('referenceFilters')]
    public function test_each_reference_filter_excludes_other_values(string $field, string $model): void
    {
        $car = $this->car();
        $attributes = ['name' => 'Other'];
        if ($model === CarModel::class) {
            $attributes['make_id'] = $car->make_id;
        }
        $other = $model::create($attributes);
        $this->car([$field => $other->id]);

        $this->getJson('/api/cars?'.$field.'='.$car->$field)->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $car->id);
    }

    public static function invalidFilters(): array
    {
        return [
            'search array' => [['search' => ['bad']], 'search'],
            'make array' => [['make_id' => [1]], 'make_id'],
            'decimal id' => [['make_id' => '1.5'], 'make_id'],
            'model array' => [['model_id' => [1]], 'model_id'],
            'fuel array' => [['fuel_type_id' => [1]], 'fuel_type_id'],
            'body array' => [['body_type_id' => [1]], 'body_type_id'],
            'transmission array' => [['transmission_id' => [1]], 'transmission_id'],
            'negative mileage' => [['mileage_max' => -1], 'mileage_max'],
            'sort injection' => [['sort_by' => 'price desc; drop table cars'], 'sort_by'],
            'direction array' => [['sort_dir' => ['asc']], 'sort_dir'],
            'negative page' => [['page' => -1], 'page'],
            'price range' => [['price_min' => 20, 'price_max' => 10], 'price_max'],
            'year range' => [['year_min' => 2020, 'year_max' => 2019], 'year_max'],
        ];
    }

    #[DataProvider('invalidFilters')]
    public function test_invalid_filters_return_422(array $query, string $field): void
    {
        $this->getJson('/api/cars?'.http_build_query($query))
            ->assertUnprocessable()->assertJsonValidationErrors($field);
    }

    public function test_pagination_preserves_filters_and_has_stable_order(): void
    {
        $ids = [];
        for ($i = 0; $i < 16; $i++) {
            $ids[] = $this->car(['title' => 'Match', 'price' => 100])->id;
        }
        $this->car(['title' => 'Excluded', 'price' => 50]);

        $first = $this->getJson('/api/cars?search=Match&sort_by=price&sort_dir=asc')->assertOk();
        $this->assertSame(array_slice($ids, 0, 15), array_column($first->json('data'), 'id'));
        $this->assertStringContainsString('search=Match', $first->json('links.next'));
        $this->getJson($first->json('links.next'))->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $ids[15]);
    }

    public function test_my_cars_search_is_owned_and_has_card_images_without_n_plus_one(): void
    {
        $car = $this->car();
        $car->images()->create(['image_path' => 'cars/test.webp', 'is_primary' => true, 'sort_order' => 0]);
        $this->car(['user_id' => $car->user_id, 'title' => 'Other']);
        $this->car(['title' => 'Roadster']);

        $this->actingAs($car->user)->getJson('/api/my-cars?search=Roadster')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $car->id)
            ->assertJsonPath('data.0.image', Storage::disk('public')->url('cars/test.webp'));

        DB::enableQueryLog();
        DB::flushQueryLog();
        $this->getJson('/api/users/'.$car->user_id.'/cars')->assertOk();
        $few = count(DB::getQueryLog());
        for ($i = 0; $i < 5; $i++) {
            $this->car(['user_id' => $car->user_id]);
        }
        DB::flushQueryLog();
        $this->getJson('/api/users/'.$car->user_id.'/cars')->assertOk();
        $this->assertSame($few, count(DB::getQueryLog()));
        DB::disableQueryLog();
    }

    public function test_image_upload_requires_a_verified_owner(): void
    {
        Storage::fake('public');
        $car = $this->car();
        $url = '/api/cars/'.$car->id.'/images';
        $this->postJson($url)->assertUnauthorized();
        $this->actingAs(User::factory()->unverified()->create())->postJson($url)->assertStatus(409);
        $this->actingAs(User::factory()->create())->postJson($url, [
            'images' => [UploadedFile::fake()->image('car.jpg')],
        ])->assertForbidden();
        $this->assertDatabaseCount('car_images', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_listing_validation_rejects_mismatched_models_and_unsafe_values(): void
    {
        $car = $this->car();
        $make = CarMake::create(['name' => 'Other Make']);
        $payload = array_merge($this->payload($car), [
            'make_id' => $make->id, 'horsepower' => 65536, 'price' => 4294967296,
        ]);
        $this->actingAs($car->user)->putJson('/api/cars/'.$car->id, $payload)
            ->assertUnprocessable()->assertJsonValidationErrors(['model_id', 'horsepower', 'price']);
        $this->assertSame(10000, $car->fresh()->price);
        $this->putJson('/api/cars/'.$car->id, array_merge($this->payload($car), ['make_id' => [1]]))
            ->assertUnprocessable()->assertJsonValidationErrors('make_id');
    }

    public function test_create_update_and_image_deletion_preserve_one_primary_and_clean_files(): void
    {
        Storage::fake('public');
        $template = $this->car();
        $this->actingAs($template->user);
        $response = $this->postJson('/api/cars', array_merge($this->payload($template), [
            'images' => [UploadedFile::fake()->image('first.jpg')],
            'user_id' => 999, 'featured' => true,
        ]))->assertCreated();
        $car = Car::findOrFail($response->json('data.id'));
        $this->assertSame($template->user_id, $car->user_id);
        $this->assertFalse($car->featured);
        $original = $car->images()->firstOrFail();

        $this->putJson('/api/cars/'.$car->id, array_merge($this->payload($car), [
            'images' => [UploadedFile::fake()->image('next.jpg')],
        ]))->assertOk();
        $this->assertSame(1, $car->images()->where('is_primary', true)->count());
        $next = $car->images()->where('id', '!=', $original->id)->firstOrFail();
        $this->assertSame(1, $next->sort_order);
        Storage::disk('public')->assertExists([$original->image_path, $next->image_path]);

        $this->putJson('/api/cars/'.$car->id.'/images/'.$next->id.'/primary')->assertOk();
        $this->assertTrue($next->fresh()->is_primary);
        $this->assertFalse($original->fresh()->is_primary);
        $this->deleteJson('/api/cars/'.$car->id.'/images/'.$next->id)->assertOk();
        Storage::disk('public')->assertMissing($next->image_path);
        $this->assertTrue($original->fresh()->is_primary);
        $this->deleteJson('/api/cars/'.$car->id)->assertOk();
        $this->assertSoftDeleted($car);
        $this->assertDatabaseCount('car_images', 0);
        Storage::disk('public')->assertMissing($original->image_path);
        $this->getJson('/api/cars/'.$car->id)->assertNotFound();
    }

    public function test_images_from_another_car_cannot_be_changed_or_deleted(): void
    {
        Storage::fake('public');
        $car = $this->car();
        $other = $this->car();
        $image = $other->images()->create(['image_path' => 'cars/other.webp', 'is_primary' => true, 'sort_order' => 0]);
        Storage::disk('public')->put($image->image_path, 'image');
        $this->actingAs($car->user);

        $this->putJson('/api/cars/'.$car->id.'/images/'.$image->id.'/primary')->assertNotFound();
        $this->deleteJson('/api/cars/'.$car->id.'/images/'.$image->id)->assertNotFound();
        $this->deleteJson('/api/cars/'.$other->id)->assertForbidden();
        $this->assertModelExists($image);
        Storage::disk('public')->assertExists($image->image_path);
    }

    public function test_failed_upload_rolls_back_listing_changes_and_removes_new_files(): void
    {
        $disk = Storage::fake('public');
        $car = $this->car();
        $failingDisk = \Mockery::mock($disk);
        $writes = 0;
        $failingDisk->shouldReceive('put')->twice()->andReturnUsing(function ($path, $contents) use ($disk, &$writes) {
            return ++$writes === 1 ? $disk->put($path, $contents) : false;
        });
        Storage::shouldReceive('disk')->with('public')->andReturn($failingDisk);

        $this->actingAs($car->user)->putJson('/api/cars/'.$car->id, array_merge($this->payload($car), [
            'title' => 'Changed',
            'images' => [UploadedFile::fake()->image('one.jpg'), UploadedFile::fake()->image('two.jpg')],
        ]))->assertStatus(500);

        $this->assertSame('Roadster', $car->fresh()->title);
        $this->assertDatabaseCount('car_images', 0);
        $this->assertSame([], $disk->allFiles());
    }

    public function test_per_upload_limit_and_non_primary_deletion_preserve_existing_primary(): void
    {
        Storage::fake('public');
        $car = $this->car();
        for ($i = 0; $i < 10; $i++) {
            $image = $car->images()->create([
                'image_path' => 'cars/'.$car->id.'/'.$i.'.webp', 'is_primary' => $i === 0, 'sort_order' => $i,
            ]);
            Storage::disk('public')->put($image->image_path, 'image');
        }
        $primary = $car->primaryImage;
        $uploads = [];
        for ($i = 0; $i < 11; $i++) {
            $uploads[] = UploadedFile::fake()->image('extra'.$i.'.jpg');
        }
        $this->actingAs($car->user)->postJson('/api/cars/'.$car->id.'/images', [
            'images' => $uploads,
        ])->assertUnprocessable()->assertJsonValidationErrors('images');
        $this->assertDatabaseCount('car_images', 10);

        $this->deleteJson('/api/cars/'.$car->id.'/images/'.$image->id)->assertOk();
        $this->assertTrue($primary->fresh()->is_primary);
        Storage::disk('public')->assertMissing($image->image_path);
        Storage::disk('public')->assertExists($primary->image_path);
    }

    public function test_sparse_upload_indexes_still_select_the_first_primary_image(): void
    {
        Storage::fake('public');
        $car = $this->car();
        $this->actingAs($car->user)->postJson('/api/cars/'.$car->id.'/images', [
            'images' => [4 => UploadedFile::fake()->image('car.jpg')],
        ])->assertOk();

        $image = $car->images()->firstOrFail();
        $this->assertTrue($image->is_primary);
        $this->assertSame(0, $image->sort_order);
        Storage::disk('public')->assertExists($image->image_path);
    }

    public function test_optional_fields_and_features_can_be_cleared(): void
    {
        $car = $this->car(['color' => 'Blue', 'engine_size' => 2]);
        $car->features()->attach(Feature::create(['name' => 'ABS', 'category' => 'safety']));

        $this->actingAs($car->user)->putJson('/api/cars/'.$car->id, array_merge($this->payload($car), [
            'features' => '', 'color' => '', 'engine_size' => '',
        ]))->assertOk()->assertJsonPath('data.engine_size', null)->assertJsonCount(0, 'data.features');
        $this->assertNull($car->fresh()->color);
        $this->assertSame(0, $car->features()->count());
    }

    public function test_account_deletion_rollback_keeps_image_files(): void
    {
        Storage::fake('public');
        $car = $this->car();
        $path = 'cars/'.$car->id.'/photo.webp';
        $image = $car->images()->create(['image_path' => $path, 'is_primary' => true, 'sort_order' => 0]);
        Storage::disk('public')->put($path, 'image');
        User::deleting(function () {
            throw new \RuntimeException('Simulated database failure');
        });

        $this->actingAs($car->user)->deleteJson('/profile')->assertStatus(500);

        $this->assertModelExists($car);
        $this->assertModelExists($image);
        Storage::disk('public')->assertExists($path);
    }

    public function test_account_deletion_cleans_active_and_soft_deleted_car_files(): void
    {
        Storage::fake('public');
        $car = $this->car();
        $deleted = $this->car(['user_id' => $car->user_id]);
        $feature = Feature::create(['name' => 'ABS', 'category' => 'safety']);
        foreach ([$car, $deleted] as $listing) {
            $path = 'cars/'.$listing->id.'/old.webp';
            $listing->images()->create(['image_path' => $path, 'is_primary' => true, 'sort_order' => 0]);
            $listing->features()->attach($feature);
            Storage::disk('public')->put($path, 'image');
        }
        $deleted->delete();
        $user = $car->user;

        $this->actingAs($user)->deleteJson('/profile')->assertOk();

        $this->assertGuest('web');
        $this->assertModelMissing($user);
        $this->assertDatabaseCount('cars', 0);
        $this->assertDatabaseCount('car_images', 0);
        $this->assertDatabaseCount('car_feature', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }
}
