<?php

namespace App\Models;

enum Cuisine: string
{
    case Italian = 'italian';
    case Japanese = 'japanese';
    case Mexican = 'mexican';
    case French = 'french';
    case American = 'american';
    case Indian = 'indian';
    case Thai = 'thai';
    case Korean = 'korean';
    case Other = 'other';
}
