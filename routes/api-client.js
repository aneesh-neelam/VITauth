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

var getExamInfo = function (req, res) {
  var semester = req.body.semester;
  var exam = req.body.exam;
  var slot = req.body.slot;
  var venue = req.body.venue;
  var time = req.body.time;
  var empid = parseInt(req.body.empid);
  var onClassFind = function (err, result) {
    if (err) {
      res.json({status: 'failure'})
    }
    else {
      var allowedEmpids = result.empids;
      if (allowedEmpids.indexOf(empid) > -1) {
        res.json({status: 'success', classes: result.classes});
      }
      else {
        res.json({status: 'failure'});
      }

    }
  };
  req.db.collection('exams').findOne({
    semester: semester,
    exam: exam,
    slot: slot,
    venue: venue,
    time: time
  }, onClassFind);
};
var submitExamReport = function (req, res) {
  var semester = req.body.semester;
  var exam = req.body.exam;
  var slot = req.body.slot;
  var venue = req.body.venue;
  var time = req.body.time;
  var classes = req.body.classes;
  var onInsert = function (err, result) {
    if (err) {
      res.json({status: 'failure'})
    }
    else {
      res.json({status: 'success'});
    }
  };
  req.db.collection('reports').insert({
    semester: semester,
    exam: exam,
    slot: slot,
    venue: venue,
    time: time,
    classes: classes
  }, onInsert);

};

router.post('/getexaminfo', getExamInfo);
router.post('/submitexamreport', submitExamReport);

module.exports = router;
