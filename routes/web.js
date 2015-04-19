/*
 *  VITauth
 *  Copyright (C) 2015  Kishore Narendran <kishore.narendran09@gmail.com>
 *  Copyright (C) 2015  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2015  Aarthy Kolachalam Chandrasekhar <kcaarthy@gmail.com>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var express = require('express');

var router = express.Router();

router.get('/', function (req, res) {
  res.render('index', {title: 'VITauth'});
});

router.get('/vit/uploadphoto', function (req, res) {
  res.render('upload_photo', {title: 'Upload Student Photo | VITauth'});
});

router.get('/vit/uploadfingerprint', function (req, res) {
  res.render('upload_fingerprint', {title: 'Upload Student Fingerprint | VITauth'});
});

module.exports = router;
