<?php

namespace App\Models;

enum Reservation: string
{
    case Required = 'required';
    case NotPossible = 'not_possible';
    case Optional = 'optional';
}
