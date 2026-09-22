<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Filters\CarFilter;
use App\Http\Requests\SearchCarRequest;
use App\Http\Requests\StoreCarRequest;
use App\Http\Requests\UpdateCarRequest;
use App\Http\Resources\CarListResource;
use App\Http\Resources\CarResource;
use App\Models\Car;
use App\Models\User;
use App\Policies\CarPolicy;
use App\Services\CarSearchService;
use App\Services\CarService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CarController extends Controller
{
    public function __construct(
        protected CarService $carService
    ) {}

    public function index(SearchCarRequest $request)
    {
        $service = new CarSearchService();
        $cars = $service->search($request->validated());

        return CarListResource::collection($cars);
    }

    public function myCars(SearchCarRequest $request)
    {
        /*
        return CarResource::collection(
            Car::where('user_id', auth()->id())
                ->latest()
                ->get()
        ); */

        return CarResource::collection(
            (new CarFilter)->apply(auth()->user()
                ->cars()
                ->with([
                    'make',
                    'model',
                    'fuelType',
                    'bodyType',
                    'transmission',
                    'features',
                    'images',
                    'primaryImage',
                    'user'
                ]), $request->validated())
                ->paginate(15)->withQueryString()
        );
    }

    public function userCars(User $user)
    {
        return CarListResource::collection(
            $user->cars()
                ->with([
                    'make',
                    'model',
                    'fuelType',
                    'primaryImage',
                    'user'
                ])
                ->latest()
                ->paginate(15)->withQueryString()
        );
    }

    public function store(StoreCarRequest $request)
    {
        //Gate::authorize('create', Car::class);
        
        $car = $this->carService->createListing($request->validated(), $request->file('images'));

        return new CarResource($car->load([
            'make',
            'model',
            'fuelType',
            'bodyType',
            'transmission',
            'features',
            'images',
            'primaryImage',
            'user'
        ]));
    }

    public function show(Car $car)
    {
        $car->load([
            'make',
            'model',
            'fuelType',
            'bodyType',
            'transmission',
            'features',
            'images',
            'primaryImage',
            'user'
        ]);

        return new CarResource($car);
    }

    public function update(UpdateCarRequest $request, Car $car)
    {   
        //abort_if(auth()->id() !== $car->user_id, 403, 'Unauthorized action!');

        Gate::authorize('update', $car);

        $updatedCar = $this->carService->updateListing($car, $request->validated(), $request->file('images'));

        return new CarResource($updatedCar);
    }

    public function destroy(Car $car)
    {
        Gate::authorize('delete', $car);

        $this->carService->deleteListing($car);

        return response()->json([
            'message' => 'Car is successfully deleted.'
        ]);
    }
}
