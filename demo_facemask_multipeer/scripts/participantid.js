const Time = require('Time');
const Patches = require('Patches');
const Reactive = require('Reactive');
const Multipeer = require('Multipeer');
const Participants = require('Participants');
const Diagnostics = require('Diagnostics');

const minTurnCount = 2;
const maxTurnCount = 4;

var constburstCountdown = 0;
var dudei = 0;
var curPlayer = 0;
var activeParticipants = [];

(async function (){
  const self = await Participants.self;
  const participants = await Participants.getAllOtherParticipants();

  participants.push(self);

  participants.forEach(function(participant) {
    participant.isActiveInSameEffect.monitor().subscribeWithSnapshot({
      userIndex: participants.indexOf(participant),
    }, function(event, snapshot){
      let participant = participants[snapshot.userIndex];
      OnUserEnterOrLeave(event.newValue, participant);
    });
    activeParticipants.push(participant);
  });

  Participants.onOtherParticipantAdded().subscribe(function(participant){
    participants.push(participant);
    participant.isActiveInSameEffect.monitor().subscribeWithSnapshot({
      userIndex: participants.indexOf(participant),
    }, function(event, snapshot){
      let participant = participants[snapshot.userIndex];
      OnUserEnterOrLeave(event.newValue, participant);
    });
  });

  SortActiveParticipantList();

  function OnUserEnterOrLeave(isActive, participant){
    if(isActive){
      let previousParticipant = activeParticipants(curPlayer);
      activeParticipants.push(participant);
      SortActiveParticipantList();
    }else{
      let activeIndex = activeParticipants.indexOf(participant);
      activeParticipants.splice(activeIndex, 1);
    }
  }

  function SortActiveParticipantList(){
    activeParticipants.sort(function(a,b){
      if (a.id < b.id){
        return -1;
      }
      if (a.id > b.id){
        return 1;
      }
    });

    dudei = 0;
    activeParticipants.forEach(element =>{
      if (activeParticipants[dudei].id == self.id){
        Diagnostics.log("checking if: " + dudei);
        Patches.inputs.setScalar('participantIndex', dudei);
        Diagnostics.log("PLayer Index set " + dudei);
      }
      dudei++;
    });
  }

})();