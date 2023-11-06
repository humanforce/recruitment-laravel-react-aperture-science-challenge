<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\UserSubject;
use Tests\TestCase;
use App\Models\User;

class ModelFunctionalTest extends TestCase
{
    public function test_if_we_can_get_usersubject_user()
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create();
        $userSubject = UserSubject::create([
            'user_id' => $user->id,
            'subject_id' => $subject->id,
        ]);
        $this->assertInstanceOf(User::class, $userSubject->user);
    }

    public function test_if_we_can_get_usersubject_subject()
    {
        $user = User::factory()->create();
        $subject = Subject::factory()->create();
        $userSubject = UserSubject::create([
            'user_id' => $user->id,
            'subject_id' => $subject->id,
        ]);
        $this->assertInstanceOf(Subject::class, $userSubject->subject);
    }
}
