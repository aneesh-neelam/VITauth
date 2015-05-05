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
var async = require('async');
var path = require('path');


var status = require(path.join(__dirname, '..', 'status'));

var router = express.Router();

var getExamInfo = function (req, res) {
  var semester = req.body.semester;
  var exam = req.body.exam;
  var slot = req.body.slot;
  var venue = req.body.venue;
  var time = req.body.time;
  var employeeID = req.body.employee_id;
  var classes;
  var classesInfo;
  var studentsInfo;
  var onFindStudentComplete = function(err, result) {
    if(err) {
      res.json({result: status.failure});
    }
    else {
      studentsInfo = result;
      for(var i = 0; i < classes.length; i++) {
        for(var j = 0; j < classesInfo.length; j++) {
          if(classes[i].class_number == classesInfo[j].class_number) {
            classes[i].title = classesInfo[j].title;
            classes[i].code = classesInfo[j].code;
            break;
          }
        }
        for(var j = 0; j < classes[i].students.length; j++) {
          for(var k = 0; k < studentsInfo.length; k++) {
            if (classes[i].students[j].register_number == studentsInfo[k].register_number) {
              classes[i].students[j].name = studentsInfo[k].name;
              classes[i].students[j].fingerprint = studentsInfo[k].fingerprint != undefined ? studentsInfo[k].fingerprint : "";
              break;
            }
          }
        }
      }
      res.json({result: status.success, classes: classes});
    }
  };
  var onFindStudent = function(eachStudent, callback) {
    req.db.collection('students').findOne({register_number: eachStudent}, callback);
  };
  var onFindClassComplete = function(err, result) {
    if(err) {
      res.json({result: status.failure});
    }
    else {
      classesInfo = result;
      var students = [];
      for(let i = 0; i < classesInfo.length; i++) {
        for(let j = 0; j < classesInfo[i].students.length; j++) {
          students.push(classesInfo[i].students[j].register_number);
        }
      }
      async.map(students, onFindStudent, onFindStudentComplete);
    }
  };
  var onFindClass = function(eachClass, callback) {
    req.db.collection('classes').findOne({class_number: eachClass.class_number}, callback);
  };
  var onFindExam = function (err, result) {
    if (err) {
      res.json({result: status.failure});
    }
    else if(result == null) {
      res.json({result: status.failure});
    }
    else {
      var allowedEmpids = result.employee_ids;
      if (allowedEmpids.indexOf(employeeID) > -1) {
        classes = result.classes;
        async.map(result.classes, onFindClass, onFindClassComplete);
      }
      else {
        res.json({result: status.failure});
      }
    }
  };
  req.db.collection('exams').findOne({
    semester: semester,
    exam: exam,
    slot: slot,
    venue: venue,
    time: time
  }, onFindExam);
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
      res.json({result: status.failure})
    }
    else {
      res.json({result: status.success});
    }
  };
  req.db.collection('reports').update({
    semester: semester,
    exam: exam,
    slot: slot,
    venue: venue,
    time: time
  }, {$set: {classes: classes }}, {upsert:true}, onInsert);

};

router.post('/getexaminfo', getExamInfo);
router.post('/submitexamreport', submitExamReport);

module.exports = router;
