import React, { useEffect } from 'react';
import $ from 'jquery'; // Import jQuery if not already imported
import GanttMaster from './assets/ganttMaster.js';

function App() {
  let ge = null; 

  useEffect(() => {
    $(function () {
      let ge = null; 
      const canWrite = true; // This is the default for test purposes

      // Gantt initialization
      ge = new GanttMaster();
      ge.set100OnClose = true;
      ge.shrinkParent = true;
      ge.init($("#workSpace"));
      loadI18n(); // Overwrite with localized ones
      delete ge.gantt.zoom; // Compute the best-fitting zoom level

      const project = loadFromLocalStorage();

      if (!project.canWrite)
        $(".ganttButtonBar button.requireWrite").attr("disabled", "true");

      ge.loadProject(project);
      ge.checkpoint(); // Empty the undo stack

      initializeHistoryManagement(ge.tasks[0].id);
    });

    $(document).on("change", "#load-file", function () {
      var uploadedFile = $("#load-file").prop("files")[0];
      upload(uploadedFile);
    });
  }, []);

  let ret = null;


  function getDemoProject() {
    //console.debug("getDemoProject")
    ret = {
      "tasks": [
        { "id": -1, "name": "Gantt editor", "progress": 0, "progressByWorklog": false, "relevance": 0, "type": "", "typeId": "", "description": "", "code": "", "level": 0, "status": "STATUS_ACTIVE", "depends": "", "canWrite": true, "start": 1396994400000, "duration": 20, "end": 1399586399999, "startIsMilestone": false, "endIsMilestone": false, "collapsed": false, "assigs": [], "hasChild": true },
        { "id": -2, "name": "coding", "progress": 0, "progressByWorklog": false, "relevance": 0, "type": "", "typeId": "", "description": "", "code": "", "level": 1, "status": "STATUS_ACTIVE", "depends": "", "canWrite": true, "start": 1396994400000, "duration": 10, "end": 1398203999999, "startIsMilestone": false, "endIsMilestone": false, "collapsed": false, "assigs": [], "hasChild": true },
        { "id": -3, "name": "gantt part", "progress": 0, "progressByWorklog": false, "relevance": 0, "type": "", "typeId": "", "description": "", "code": "", "level": 2, "status": "STATUS_ACTIVE", "depends": "", "canWrite": true, "start": 1396994400000, "duration": 2, "end": 1397167199999, "startIsMilestone": false, "endIsMilestone": false, "collapsed": false, "assigs": [], "hasChild": false },
        { "id": -4, "name": "editor part", "progress": 0, "progressByWorklog": false, "relevance": 0, "type": "", "typeId": "", "description": "", "code": "", "level": 2, "status": "STATUS_SUSPENDED", "depends": "3", "canWrite": true, "start": 1397167200000, "duration": 4, "end": 1397685599999, "startIsMilestone": false, "endIsMilestone": false, "collapsed": false, "assigs": [], "hasChild": false },
        { "id": -5, "name": "testing", "progress": 0, "progressByWorklog": false, "relevance": 0, "type": "", "typeId": "", "description": "", "code": "", "level": 1, "status": "STATUS_SUSPENDED", "depends": "2:5", "canWrite": true, "start": 1398981600000, "duration": 5, "end": 1399586399999, "startIsMilestone": false, "endIsMilestone": false, "collapsed": false, "assigs": [], "hasChild": true },
        { "id": -6, "name": "test on safari", "progress": 0, "progressByWorklog": false, "relevance": 0, "type": "", "typeId": "", "description": "", "code": "", "level": 2, "status": "STATUS_SUSPENDED", "depends": "", "canWrite": true, "start": 1398981600000, "duration": 2, "end": 1399327199999, "startIsMilestone": false, "endIsMilestone": false, "collapsed": false, "assigs": [], "hasChild": false },
        { "id": -7, "name": "test on ie", "progress": 0, "progressByWorklog": false, "relevance": 0, "type": "", "typeId": "", "description": "", "code": "", "level": 2, "status": "STATUS_SUSPENDED", "depends": "6", "canWrite": true, "start": 1399327200000, "duration": 3, "end": 1399586399999, "startIsMilestone": false, "endIsMilestone": false, "collapsed": false, "assigs": [], "hasChild": false },
        { "id": -8, "name": "test on chrome", "progress": 0, "progressByWorklog": false, "relevance": 0, "type": "", "typeId": "", "description": "", "code": "", "level": 2, "status": "STATUS_SUSPENDED", "depends": "6", "canWrite": true, "start": 1399327200000, "duration": 2, "end": 1399499999999, "startIsMilestone": false, "endIsMilestone": false, "collapsed": false, "assigs": [], "hasChild": false }
      ], "selectedRow": 2, "deletedTaskIds": [],
      "resources": [
        { "id": "tmp_1", "name": "Resource 1" },
        { "id": "tmp_2", "name": "Resource 2" },
        { "id": "tmp_3", "name": "Resource 3" },
        { "id": "tmp_4", "name": "Resource 4" }
      ],
      "roles": [
        { "id": "tmp_1", "name": "Project Manager" },
        { "id": "tmp_2", "name": "Worker" },
        { "id": "tmp_3", "name": "Stakeholder" },
        { "id": "tmp_4", "name": "Customer" }
      ], "canWrite": true, "canDelete": true, "canWriteOnParent": true, canAdd: true
    }


    //actualize data
    var offset = new Date().getTime() - ret.tasks[0].start;
    for (var i = 0; i < ret.tasks.length; i++) {
      ret.tasks[i].start = ret.tasks[i].start + offset;
    }
    return ret;
  }



  function loadGanttFromServer(taskId, callback) {
    var ret = loadFromLocalStorage();
    return ret;
  }

  function upload(uploadedFile) {
    var fileread = new FileReader();

    fileread.onload = function (e) {
      var content = e.target.result;
      var intern = JSON.parse(content); // Array of Objects.
      ge.loadProject(intern);
      ge.checkpoint(); //empty the undo stack

    };

    fileread.readAsText(uploadedFile);
  }

  function saveGanttOnServer() {
    var prj = ge.saveProject();
    download(JSON.stringify(prj, null, '\t'), "MyProject.json", "application/json");

  }

  function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
      var a = document.createElement("a"),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  function newProject() {
    clearGantt();
  }


  function clearGantt() {
    ge.reset();
  }

  function getFile() {
    $("#gimBaPrj").val(JSON.stringify(ge.saveProject()));
    $("#gimmeBack").submit();
    $("#gimBaPrj").val("");


  }


  function loadFromLocalStorage() {
    var ret;
    if (localStorage) {
      if (localStorage.getObject("teamworkGantDemo")) {
        ret = localStorage.getObject("teamworkGantDemo");
      }
    }

    if (!ret || !ret.tasks || ret.tasks.length == 0) {
      ret = getDemoProject();
    }
    return ret;
  }


  function saveInLocalStorage() {
    var prj = ge.saveProject();

    if (localStorage) {
      localStorage.setObject("teamworkGantDemo", prj);
    }
  }


  function editResources() {

    //make resource editor
    var resourceEditor = $.JST.createFromTemplate({}, "RESOURCE_EDITOR");
    var resTbl = resourceEditor.find("#resourcesTable");

    for (var i = 0; i < ge.resources.length; i++) {
      var res = ge.resources[i];
      resTbl.append($.JST.createFromTemplate(res, "RESOURCE_ROW"))
    }


    //bind add resource
    resourceEditor.find("#addResource").click(function () {
      resTbl.append($.JST.createFromTemplate({ id: "new", name: "resource" }, "RESOURCE_ROW"))
    });

    //bind save event
    resourceEditor.find("#resSaveButton").click(function () {
      var newRes = [];
      //find for deleted res
      for (var i = 0; i < ge.resources.length; i++) {
        var res = ge.resources[i];
        var row = resourceEditor.find("[resId=" + res.id + "]");
        if (row.length > 0) {
          //if still there save it
          var name = row.find("input[name]").val();
          if (name && name != "")
            res.name = name;
          newRes.push(res);
        } else {
          //remove assignments
          for (var j = 0; j < ge.tasks.length; j++) {
            var task = ge.tasks[j];
            var newAss = [];
            for (var k = 0; k < task.assigs.length; k++) {
              var ass = task.assigs[k];
              if (ass.resourceId != res.id)
                newAss.push(ass);
            }
            task.assigs = newAss;
          }
        }
      }

      //loop on new rows
      var cnt = 0
      resourceEditor.find("[resId=new]").each(function () {
        cnt++;
        var row = $(this);
        var name = row.find("input[name]").val();
        if (name && name != "")
          newRes.push(new Resource("tmp_" + new Date().getTime() + "_" + cnt, name));
      });

      ge.resources = newRes;

      closeBlackPopup();
      ge.redraw();
    });


    var ndo = createModalPopup(400, 500).append(resourceEditor);
  }

  function initializeHistoryManagement(taskId) {
    $.getJSON(contextPath + "/applications/teamwork/task/taskAjaxController.jsp", { CM: "GETGANTTHISTPOINTS", OBJID: taskId }, function (response) {
      if (response.ok == true && response.historyPoints && response.historyPoints.length > 0) {

        //add show slider button on button bar
        var histBtn = $("<button>").addClassNclassName("button textual icon lreq30 lreqLabel").attr("title", "SHOW_HISTORY").append("<span className=\"teamworkIcon\">&#x60;</span>");

        //clicking it
        histBtn.click(function () {
          var el = $(this);
          var ganttButtons = $(".ganttButtonBar .buttons");

          //is it already on?
          if (!ge.element.is(".historyOn")) {
            ge.element.addClassNclassName("historyOn");
            ganttButtons.find(".requireCanWrite").hide();

            //load the history points from server again
            showSavingMessage();
            $.getJSON(contextPath + "/applications/teamwork/task/taskAjaxController.jsp", { CM: "GETGANTTHISTPOINTS", OBJID: ge.tasks[0].id }, function (response) {
              jsonResponseHandling(response);
              hideSavingMessage();
              if (response.ok == true) {
                var dh = response.historyPoints;
                if (dh && dh.length > 0) {
                  //si crea il div per lo slider
                  var sliderDiv = $("<div>").prop("id", "slider").addClassNclassName("lreq30 lreqHide").css({ "display": "inline-block", "width": "500px" });
                  ganttButtons.append(sliderDiv);

                  var minVal = 0;
                  var maxVal = dh.length - 1;

                  $("#slider").show().mbSlider({
                    rangeColor: '#2f97c6',
                    minVal: minVal,
                    maxVal: maxVal,
                    startAt: maxVal,
                    showVal: false,
                    grid: 1,
                    formatValue: function (val) {
                      return new Date(dh[val]).format();
                    },
                    onSlideLoad: function (obj) {
                      this.onStop(obj);

                    },
                    onStart: function (obj) { },
                    onStop: function (obj) {
                      var val = $(obj).mbgetVal();
                      showSavingMessage();
                      $.getJSON(contextPath + "/applications/teamwork/task/taskAjaxController.jsp", { CM: "GETGANTTHISTORYAT", OBJID: ge.tasks[0].id, millis: dh[val] }, function (response) {
                        jsonResponseHandling(response);
                        hideSavingMessage();
                        if (response.ok) {
                          ge.baselines = response.baselines;
                          ge.showBaselines = true;
                          ge.baselineMillis = dh[val];
                          ge.redraw();
                        }
                      })

                    },
                    onSlide: function (obj) {
                      clearTimeout(obj.renderHistory);
                      var self = this;
                      obj.renderHistory = setTimeout(function () {
                        self.onStop(obj);
                      }, 200)

                    }
                  });
                }
              }
            });


            // closing the history
          } else {
            //remove the slider
            $("#slider").remove();
            ge.element.removeClassNclassName("historyOn");
            if (ge.permissions.canWrite)
              ganttButtons.find(".requireCanWrite").show();

            ge.showBaselines = false;
            ge.baselineMillis = undefined;
            ge.redraw();
          }

        });
        $("#saveGanttButton").before(histBtn);
      }
    })
  }

  function showBaselineInfo(event, element) {
    //alert(element.attr("data-label"));
    $(element).showBalloon(event, $(element).attr("data-label"));
    ge.splitter.secondBox.one("scroll", function () {
      $(element).hideBalloon();
    })
  }


  $.JST.loadDecorator("RESOURCE_ROW", function (resTr, res) {
    resTr.find(".delRes").click(function () { $(this).closest("tr").remove() });
  });

  $.JST.loadDecorator("ASSIGNMENT_ROW", function (assigTr, taskAssig) {
    var resEl = assigTr.find("[name=resourceId]");
    var opt = $("<option>");
    resEl.append(opt);
    for (var i = 0; i < taskAssig.task.master.resources.length; i++) {
      var res = taskAssig.task.master.resources[i];
      opt = $("<option>");
      opt.val(res.id).html(res.name);
      if (taskAssig.assig.resourceId == res.id)
        opt.attr("selected", "true");
      resEl.append(opt);
    }
    var roleEl = assigTr.find("[name=roleId]");
    for (var i = 0; i < taskAssig.task.master.roles.length; i++) {
      var role = taskAssig.task.master.roles[i];
      var optr = $("<option>");
      optr.val(role.id).html(role.name);
      if (taskAssig.assig.roleId == role.id)
        optr.attr("selected", "true");
      roleEl.append(optr);
    }

    if (taskAssig.task.master.permissions.canWrite && taskAssig.task.canWrite) {
      assigTr.find(".delAssig").click(function () {
        var tr = $(this).closest("[assId]").fadeOut(200, function () { $(this).remove() });
      });
    }

  });


  function loadI18n() {
    GanttMaster.messages = {
      "CANNOT_WRITE": "No permission to change the following task:",
      "CHANGE_OUT_OF_SCOPE": "Project update not possible as you lack rights for updating a parent project.",
      "START_IS_MILESTONE": "Start date is a milestone.",
      "END_IS_MILESTONE": "End date is a milestone.",
      "TASK_HAS_CONSTRAINTS": "Task has constraints.",
      "GANTT_ERROR_DEPENDS_ON_OPEN_TASK": "Error: there is a dependency on an open task.",
      "GANTT_ERROR_DESCENDANT_OF_CLOSED_TASK": "Error: due to a descendant of a closed task.",
      "TASK_HAS_EXTERNAL_DEPS": "This task has external dependencies.",
      "GANNT_ERROR_LOADING_DATA_TASK_REMOVED": "GANNT_ERROR_LOADING_DATA_TASK_REMOVED",
      "CIRCULAR_REFERENCE": "Circular reference.",
      "CANNOT_DEPENDS_ON_ANCESTORS": "Cannot depend on ancestors.",
      "INVALID_DATE_FORMAT": "The data inserted are invalid for the field format.",
      "GANTT_ERROR_LOADING_DATA_TASK_REMOVED": "An error has occurred while loading the data. A task has been trashed.",
      "CANNOT_CLOSE_TASK_IF_OPEN_ISSUE": "Cannot close a task with open issues",
      "TASK_MOVE_INCONSISTENT_LEVEL": "You cannot exchange tasks of different depth.",
      "CANNOT_MOVE_TASK": "CANNOT_MOVE_TASK",
      "PLEASE_SAVE_PROJECT": "PLEASE_SAVE_PROJECT",
      "GANTT_SEMESTER": "Semester",
      "GANTT_SEMESTER_SHORT": "s.",
      "GANTT_QUARTER": "Quarter",
      "GANTT_QUARTER_SHORT": "q.",
      "GANTT_WEEK": "Week",
      "GANTT_WEEK_SHORT": "w."
    };
  }



  function createNewResource(el) {
    var row = el.closest("tr[taskid]");
    var name = row.find("[name=resourceId_txt]").val();
    var url = contextPath + "/applications/teamwork/resource/resourceNew.jsp?CM=ADD&name=" + encodeURI(name);

    openBlackPopup(url, 700, 320, function (response) {
      //fillare lo smart combo
      if (response && response.resId && response.resName) {
        //fillare lo smart combo e chiudere l'editor
        row.find("[name=resourceId]").val(response.resId);
        row.find("[name=resourceId_txt]").val(response.resName).focus().blur();
      }

    });
  }


  const handleCalendarClick = () => {
    // Add your calendar click handling logic here
    // For example:
    console.log('Calendar clicked');
  };

  return (

    <div style={{ backgroundColor: '#fff' }}>
      <div id="workSpace" style="{{ padding:0px; overflow-y:auto; overflow-x:hidden;border:1px solid #e5e5e5;position:relative;margin:0 5px }}">

      </div>
      <form id="gimmeBack" style="display:none;" action="../gimmeBack.jsp" method="post" target="_blank">
        <input type="hidden" name="prj" id="gimBaPrj" />

      </form>

      <div id="gantEditorTemplates" style="display:none;">
        <div className="__template__" type="GANTBUTTONS">

          <div className="ganttButtonBar noprint">
            <div className="buttons">
              <a href="https://gantt.twproject.com/">
                <img src="res/twGanttLogo.png" alt="Twproject" align="absmiddle" style="max-width: 136px; padding-right: 15px" />
              </a>

              <button onclick="$('#workSpace').trigger('undo.gantt');return false;" className="button textual icon requireCanWrite" title="undo"><span className="teamworkIcon">&#39;</span></button>
              <button onclick="$('#workSpace').trigger('redo.gantt');return false;" className="button textual icon requireCanWrite" title="redo"><span className="teamworkIcon">&middot;</span></button>
              <span className="ganttButtonSeparator requireCanWrite requireCanAdd"></span>
              <button onclick="$('#workSpace').trigger('addAboveCurrentTask.gantt');return false;" className="button textual icon requireCanWrite requireCanAdd" title="insert above"><span className="teamworkIcon">l</span></button>
              <button onclick="$('#workSpace').trigger('addBelowCurrentTask.gantt');return false;" className="button textual icon requireCanWrite requireCanAdd" title="insert below"><span className="teamworkIcon">X</span></button>
              <span className="ganttButtonSeparator requireCanWrite requireCanInOutdent"></span>
              <button onclick="$('#workSpace').trigger('outdentCurrentTask.gantt');return false;" className="button textual icon requireCanWrite requireCanInOutdent" title="un-indent task"><span className="teamworkIcon">.</span></button>
              <button onclick="$('#workSpace').trigger('indentCurrentTask.gantt');return false;" className="button textual icon requireCanWrite requireCanInOutdent" title="indent task"><span className="teamworkIcon">:</span></button>
              <span className="ganttButtonSeparator requireCanWrite requireCanMoveUpDown"></span>
              <button onclick="$('#workSpace').trigger('moveUpCurrentTask.gantt');return false;" className="button textual icon requireCanWrite requireCanMoveUpDown" title="move up"><span className="teamworkIcon">k</span></button>
              <button onclick="$('#workSpace').trigger('moveDownCurrentTask.gantt');return false;" className="button textual icon requireCanWrite requireCanMoveUpDown" title="move down"><span className="teamworkIcon">j</span></button>
              <span className="ganttButtonSeparator requireCanWrite requireCanDelete"></span>
              <button onclick="$('#workSpace').trigger('deleteFocused.gantt');return false;" className="button textual icon delete requireCanWrite" title="Elimina"><span className="teamworkIcon">&cent;</span></button>
              <span className="ganttButtonSeparator"></span>
              <button onclick="$('#workSpace').trigger('expandAll.gantt');return false;" className="button textual icon " title="EXPAND_ALL"><span className="teamworkIcon">6</span></button>
              <button onclick="$('#workSpace').trigger('collapseAll.gantt'); return false;" className="button textual icon " title="COLLAPSE_ALL"><span className="teamworkIcon">5</span></button>

              <span className="ganttButtonSeparator"></span>
              <button onclick="$('#workSpace').trigger('zoomMinus.gantt'); return false;" className="button textual icon " title="zoom out"><span className="teamworkIcon">)</span></button>
              <button onclick="$('#workSpace').trigger('zoomPlus.gantt');return false;" className="button textual icon " title="zoom in"><span className="teamworkIcon">(</span></button>
              <span className="ganttButtonSeparator"></span>
              <button onclick="$('#workSpace').trigger('print.gantt');return false;" className="button textual icon " title="Print"><span className="teamworkIcon">p</span></button>
              <span className="ganttButtonSeparator"></span>
              <button onclick="ge.gantt.showCriticalPath=!ge.gantt.showCriticalPath; ge.redraw();return false;" className="button textual icon requireCanSeeCriticalPath" title="CRITICAL_PATH"><span className="teamworkIcon">&pound;</span></button>
              <span className="ganttButtonSeparator requireCanSeeCriticalPath"></span>
              <button onclick="ge.splitter.resize(.1);return false;" className="button textual icon" ><span className="teamworkIcon">F</span></button>
              <button onclick="ge.splitter.resize(50);return false;" className="button textual icon" ><span className="teamworkIcon">O</span></button>
              <button onclick="ge.splitter.resize(100);return false;" className="button textual icon"><span className="teamworkIcon">R</span></button>
              <span className="ganttButtonSeparator"></span>
              <button onclick="$('#workSpace').trigger('fullScreen.gantt');return false;" className="button textual icon" title="FULLSCREEN" id="fullscrbtn"><span className="teamworkIcon">@</span></button>
              <button onclick="ge.element.toggleClassNclassName('colorByStatus' );return false;" className="button textual icon"><span className="teamworkIcon">&sect;</span></button>

              <button onclick="editResources();" className="button textual requireWrite" title="edit resources"><span className="teamworkIcon">M</span></button>
              &nbsp; &nbsp; &nbsp; &nbsp;
            </div>

            <div>
              <button onclick="saveGanttOnServer();" className="button first big requireWrite" title="Save">Save</button>
              <input type="file" name="load-file" id="load-file" />
              <label for="load-file">Load</label>
              <button onclick='newProject();' className='button requireWrite newproject'><em>clear project</em></button>
              <button className="button login" title="login/enroll" onclick="loginEnroll($(this));" style="display:none;">login/enroll</button>
              <button className="button opt collab" title="Start with Twproject" onclick="collaborate($(this));" style="display:none;"><em>collaborate</em></button>
            </div>
          </div>

        </div>

        <div className="__template__" type="TASKSEDITHEAD">
          <table className="gdfTable" cellSpacing="0" cellPadding="0">
            <thead>
              <tr style={{ height: '40px' }}>
                <th className="gdfColHeader" style={{ width: '35px', borderRight: 'none' }}></th>
                <th className="gdfColHeader" style={{ width: '25px' }}></th>
                <th className="gdfColHeader gdfResizable" style={{ width: '100px' }}>code/short name</th>
                <th className="gdfColHeader gdfResizable" style={{ width: '300px' }}>name</th>
                <th className="gdfColHeader" align="center" style={{ width: '17px' }} title="Start date is a milestone."><span className="teamworkIcon" style={{ fontSize: '8px' }}>^</span></th>
                <th className="gdfColHeader gdfResizable" style={{ width: '80px' }}>start</th>
                <th className="gdfColHeader" align="center" style={{ width: '17px' }} title="End date is a milestone."><span className="teamworkIcon" style={{ fontSize: '8px' }}>^</span></th>
                <th className="gdfColHeader gdfResizable" style={{ width: '80px' }}>End</th>
                <th className="gdfColHeader gdfResizable" style={{ width: '50px' }}>dur.</th>
                <th className="gdfColHeader gdfResizable" style={{ width: '20px' }}>%</th>
                <th className="gdfColHeader gdfResizable requireCanSeeDep" style={{ width: '50px' }}>depe.</th>
                <th className="gdfColHeader gdfResizable" style={{ width: '1000px', textAlign: 'left', paddingLeft: '10px' }}>assignees</th>
              </tr>
            </thead>
          </table>
        </div>

        <div className="__template__" type="TASKROW">
          <tr id={`tid_${obj.id}`} taskId={obj.id} className={`taskEditRow ${obj.isParent() ? 'isParent' : ''} ${obj.collapsed ? 'collapsed' : ''}`} level={level}>
            <th className="gdfCell edit" align="right" style={{ cursor: 'pointer' }}><span className="taskRowIndex">{obj.getRow() + 1}</span> <span className="teamworkIcon" style={{ fontSize: '12px' }}>e</span></th>
            <td className="gdfCell noClip" align="center"><div className="taskStatus cvcColorSquare" status={obj.status}></div></td>
            <td className="gdfCell"><input type="text" name="code" value={obj.code ? obj.code : ''} placeholder="code/short name" /></td>
            <td className="gdfCell indentCell" style={{ paddingLeft: `${obj.level * 10 + 18}px` }}>
              <div className="exp-controller" align="center"></div>
              <input type="text" name="name" value={obj.name} placeholder="name" />
            </td>
            <td className="gdfCell" align="center"><input type="checkbox" name="startIsMilestone" /></td>
            <td className="gdfCell"><input type="text" name="start" value="" className="date" /></td>
            <td className="gdfCell" align="center"><input type="checkbox" name="endIsMilestone" /></td>
            <td className="gdfCell"><input type="text" name="end" value="" className="date" /></td>
            <td className="gdfCell"><input type="text" name="duration" autoComplete="off" value={obj.duration} /></td>
            <td className="gdfCell"><input type="text" name="progress" className="validated" entrytype="PERCENTILE" autoComplete="off" value={obj.progress ? obj.progress : ''} readOnly={obj.progressByWorklog} /></td>
            <td className="gdfCell requireCanSeeDep">
              <input type="text" name="depends" autoComplete="off" value={obj.depends} readOnly={obj.hasExternalDep} />
            </td>
            <td className="gdfCell taskAssigs">{obj.getAssigsString()}</td>
          </tr>
        </div>

        <div className="__template__" type="TASKEMPTYROW">
          <tr className="taskEditRow emptyRow">
            <th className="gdfCell" align="right"></th>
            <td className="gdfCell noClip" align="center"></td>
            <td className="gdfCell"></td>
            <td className="gdfCell"></td>
            <td className="gdfCell"></td>
            <td className="gdfCell"></td>
            <td className="gdfCell"></td>
            <td className="gdfCell"></td>
            <td className="gdfCell"></td>
            <td className="gdfCell"></td>
            <td className="gdfCell requireCanSeeDep"></td>
            <td className="gdfCell"></td>
          </tr>
        </div>

        <div className="__template__" type="TASKBAR">
          <div className={`taskBox taskBoxDiv ${obj.hasExternalDep ? 'extDep' : ''}`} taskId={obj.id}>
            <div className="layout">
              <div className="taskStatus" status={obj.status}></div>
              <div className="taskProgress" style={{ width: `${obj.progress > 100 ? 100 : obj.progress}%`, backgroundColor: `${obj.progress > 100 ? 'red' : 'rgb(153, 255, 51)'}` }}></div>
              <div className={`milestone ${obj.startIsMilestone ? 'active' : ''}`}></div>
              <div className="taskLabel"></div>
              <div className={`milestone end ${obj.endIsMilestone ? 'active' : ''}`}></div>
            </div>
          </div>
        </div>

        <div className="__template__" type="CHANGE_STATUS">
          <div className="taskStatusBox">
            <div className="taskStatus cvcColorSquare" status="STATUS_ACTIVE" title="Active"></div>
            <div className="taskStatus cvcColorSquare" status="STATUS_DONE" title="Completed"></div>
            <div className="taskStatus cvcColorSquare" status="STATUS_FAILED" title="Failed"></div>
            <div className="taskStatus cvcColorSquare" status="STATUS_SUSPENDED" title="Suspended"></div>
            <div className="taskStatus cvcColorSquare" status="STATUS_WAITING" title="Waiting" style={{ display: 'none' }}></div>
            <div className="taskStatus cvcColorSquare" status="STATUS_UNDEFINED" title="Undefined"></div>
          </div>
        </div>




        <div className="__template__" type="TASK_EDITOR">
          <div className="ganttTaskEditor">
            <h2 className="taskData">Task editor</h2>
            <table cellspacing="1" cellpadding="5" width="100%" className="taskData table" border="0">
              <tr>
                <td width="200" style="{height: 80px}" valign="top">
                  <label for="code">code/short name</label><br />
                  <input type="text" name="code" id="code" value="" size={15} className="formElements" autocomplete='off' maxlength={255} style='{width:100%}' oldvalue="1" />
                </td>
                <td colspan="3" valign="top"><label for="name" className="required">name</label><br />
                  <input type="text" name="name" id="name" className="formElements" autocomplete='off' maxlength={255} style='{width:100%}' value="" required="true" oldvalue="1" />
                </td>
              </tr>


              <tr className="dateRow">
                <td>
                  <div style="{position:relative}">
                    <label htmlFor="start">start</label>&nbsp;&nbsp;&nbsp;&nbsp;
                    <input type="checkbox" id="startIsMilestone" name="startIsMilestone" value="yes" /> &nbsp;
                    <label htmlFor="startIsMilestone">is milestone</label>&nbsp;
                    <br />
                    <input type="text"
                      name="start"
                      id="start"
                      size="8"
                      className="formElements dateField validated date"
                      autoComplete="off"
                      maxLength="255"
                      value=""
                      oldvalue="1"
                      entrytype="DATE" />
                    <span
                      title="calendar"
                      id="starts_inputDate"
                      className="teamworkIcon openCalendar"
                      onClick={handleCalendarClick}
                      style={{ cursor: 'pointer' }}
                    >m
                    </span>
                  </div>
                </td>

                <td>
                  <label htmlFor="end">End</label>&nbsp;&nbsp;&nbsp;&nbsp;
                  <input type="checkbox" id="endIsMilestone" name="endIsMilestone" value="yes" />&nbsp;
                  <label htmlFor="endIsMilestone">is milestone</label>&nbsp;
                  <br />
                  <input type="text"
                    name="end"
                    id="end"
                    size="8"
                    className="formElements dateField validated date"
                    autoComplete="off"
                    maxLength="255"
                    value=""
                    oldvalue="1"
                    entrytype="DATE" />
                  <span
                    title="calendar"
                    id="ends_inputDate"
                    className="teamworkIcon openCalendar"
                    onClick={handleCalendarClick}
                    style={{ cursor: 'pointer' }}
                  >
                    m
                  </span>
                </td>


                <td>
                  <label for="duration" className=" ">Days</label><br />
                  <input type="text" name="duration" id="duration" size="4" className="formElements validated durationdays" title="Duration is in working days." autocomplete="off" maxlength="255" value="" oldvalue="1" entrytype="DURATIONDAYS" />
                </td>
              </tr>

              <tr>
                <td colspan="2">
                  <label for="status" className=" ">status</label><br />
                    <select id="status" name="status" className="taskStatus" status="(#=obj.status#)" onchange="$(this).attr('STATUS',$(this).val());">
                      <option value="STATUS_ACTIVE" className="taskStatus" status="STATUS_ACTIVE" >active</option>
                      <option value="STATUS_WAITING" className="taskStatus" status="STATUS_WAITING" >suspended</option>
                      <option value="STATUS_SUSPENDED" className="taskStatus" status="STATUS_SUSPENDED" >suspended</option>
                      <option value="STATUS_DONE" className="taskStatus" status="STATUS_DONE" >completed</option>
                      <option value="STATUS_FAILED" className="taskStatus" status="STATUS_FAILED" >failed</option>
                      <option value="STATUS_UNDEFINED" className="taskStatus" status="STATUS_UNDEFINED" >undefined</option>
                    </select>
                </td>

                <td valign="top">
                    <label>progress</label><br />
                    <input type="text" name="progress" id="progress" size="7" className="formElements validated percentile" autocomplete="off" maxlength="255" value="" oldvalue="1" entrytype="PERCENTILE" />
                    </td>
              
              </tr>
              <tr>
                <td colspan="4">
                  <label for="description">Description</label><br />
                    <textarea rows="3" cols="30" id="description" name="description" className="formElements" style="width:100%"></textarea>
                </td>
              </tr>
            </table>

            <h2>Assignments</h2>
            <table cellspacing="1" cellpadding="0" width="100%" id="assigsTable">
              <tr>
                <th style="width:100px;">name</th>
                <th style="width:70px;">Role</th>
                <th style="width:30px;">est.wklg.</th>
                <th style="width:30px;" id="addAssig"><span className="teamworkIcon" style="cursor: pointer">+</span></th>
              </tr>
            </table>

            <div style="text-align: right; padding-top: 20px">
              <span id="saveButton" className="button first" onClick="$(this).trigger('saveFullEditor.gantt');">Save</span>
            </div>

          </div>
        </div>



        <div className="__template__" type="ASSIGNMENT_ROW">
          <table>
            <tbody>
              <tr taskId={obj.task.id} assId={obj.assig.id} className="assigEditRow">
                <td>
                  <select name="resourceId" className="formElements" disabled={obj.assig.id.indexOf("tmp_") === 0 ? '' : 'disabled'}></select>
                </td>
                <td><select type="select" name="roleId" className="formElements"></select></td>
                <td><input type="text" name="effort" value={getMillisInHoursMinutes(obj.assig.effort)} size="5" className="formElements" /></td>
                <td align="center"><span className="teamworkIcon delAssig del" style={{ cursor: 'pointer' }}>d</span></td>
              </tr>
            </tbody>
          </table>
        </div>



        <div className="__template__" type="RESOURCE_EDITOR">
          <div className="resourceEditor" style={{ padding: '5px' }}>
            <h2>Project team</h2>
            <table cellspacing="1" cellpadding="0" width="100%" id="resourcesTable">
              <tbody>
                <tr>
                  <th style={{ width: '100px' }}>name</th>
                  <th style={{ width: '30px' }} id="addResource"><span className="teamworkIcon" style={{ cursor: 'pointer' }}>+</span></th>
                </tr>
              </tbody>
            </table>
            <div style={{ textAlign: 'right', paddingTop: '20px' }}><button id="resSaveButton" className="button big">Save</button></div>
          </div>
        </div>


        <div className="__template__" type="RESOURCE_ROW">
          <table>
            <tbody>
              <tr resId="(#=obj.id#)" className="resRow">
                <td><input type="text" name="name" value="(#=obj.name#)" style={{ width: '100%' }} className="formElements" /></td>
                <td align="center"><span className="teamworkIcon delRes del" style={{ cursor: 'pointer' }}>d</span></td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>

  );
}

export default App;
