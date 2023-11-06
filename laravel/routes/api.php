<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Models\Subject;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

const ACL_HEADERS = [
    'Access-Control-Allow-Headers'     => 'Content-Type, Accept, x-xsrf-token',
    'Access-Control-Allow-Origin'      => 'http://localhost:3000',
    'Access-Control-Allow-Credentials' => 'true',
];

// API Routes
Route::middleware('auth:sanctum')->group(function () {

    // Create Subject Route
    Route::post('/createSubject', function (Request $request) {
        // TODO use form requests + controllers instead of this.
        DB::beginTransaction();
        try {
            $subject = Subject::where('name', $request->input('name'))->first();
            $data = [
                'name'          => $request->input('name'),
                'test_chamber'  => $request->input('test_chamber'),
                'date_of_birth' => $request->input('date_of_birth'),
                'score'         => $request->input('score'),
                'alive'         => $request->input('alive'),
            ];
            if (!$subject instanceof Subject) {
                $subject = Subject::create($data);
            }
            $subject->update($data);
            DB::commit();
            $response = response($subject);
        } catch (Throwable $e) {
            // Roll back and bubble the error back up.
            DB::rollBack();
            $response = response($e);
        }
        foreach (ACL_HEADERS as $header => $value) {
            $response->header($header, $value);
        }
        return $response;
    });

});

// Options
$optionsRoutes = ['createSubject', 'logout'];
foreach ($optionsRoutes as $optionsRoute) {
    Route::options("/$optionsRoute", function (Request $request) {
        $response = response('', 200);
        foreach (ACL_HEADERS as $header => $value) {
            $response->header($header, $value);
        }
        return $response;
    });
}

// Logout
Route::POST('/logout', function (Request $request) {
    // Wipe Access Tokens.
    /** @var \App\Models\User $user */
    $user = $request->user();
    if ($user) {
        if ($user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }
        foreach ($user->tokens() as $token) {
            $token->delete();
        }
    }

    // Wipe Auth Facade Logins.
    Auth::logout();

    // Return A Message.
    return Response("Gone Away");
});
