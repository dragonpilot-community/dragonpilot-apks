import ChffrPlus from '../../native/ChffrPlus';
import { Params } from '../../config';

export const ACTION_PARAM_CHANGED = 'ACTION_PARAM_CHANGED';
export const ACTION_PARAM_DELETED = 'ACTION_PARAM_DELETED';

const PARAMS = [
  "AccessToken",
  "CalibrationParams",
  "CompletedTrainingVersion",
  "ControlsParams",
  "DongleId",
  "GitBranch",
  "GitCommit",
  "GitRemote",
  "HasAcceptedTerms",
  "HasCompletedSetup",
  "IsGeofenceEnabled",
  "IsMetric",
  "IsUploadVideoOverCellularEnabled",
  "LimitSetSpeed",
  "LiveParameters",
  "LongitudinalControl",
  "Passive",
  "RecordFront",
  "SpeedLimitOffset",
  "TrainingVersion",
  "Version",
  // dragonpilot
  "DragonLatCtrl",
  "DragonAllowGas",
  "DragonEnableLogger",
  "DragonEnableUploader",
  "DragonEnableSteeringOnSignal",
  "DragonEnableDashcam",
  "DragonEnableDriverSafetyCheck",
  "DragonAutoShutdownAt",
  "DragonNoctuaMode",
  "DragonCacheCar",
  "DragonToyotaStockDSU",
  "DragonUISpeed",
  "DragonUIEvent",
  "DragonUIMaxSpeed",
  "DragonUIFace",
  "DragonUIDev",
  "DragonUIDevMini",
  "DragonEnableTomTom",
  "DragonBootTomTom",
  "DragonRunTomTom",
  "DragonEnableAutonavi",
  "DragonBootAutonavi",
  "DragonRunAutonavi",
  "DragonEnableMixplorer",
  "DragonRunMixplorer",
  "DragonSteeringMonitorTimer",
  "DragonCameraOffset",
  "DragonUIVolumeBoost",
  "DragonGreyPandaMode",
  "DragonDrivingUI",
  "DragonDisplaySteeringLimitAlert",
  "DragonChargingCtrl",
  "DragonToyotaLaneDepartureWarning",
  "DragonUILane",
  "DragonUILead",
  "DragonUIPath",
  "DragonUIBlinker",
  "DragonEnableDriverMonitoring",
];

export function refreshParams() {
  return async function(dispatch) {
    await Promise.all(PARAMS.map(function(param) {
      return ChffrPlus.readParam(param).then(function(value) {
        dispatch({ type: ACTION_PARAM_CHANGED, payload: { param, value }});
      });
    }));
  }
}

export function updateParam(param, value) {
  return function(dispatch) {
    dispatch({ type: ACTION_PARAM_CHANGED, payload: { param, value }});
    setTimeout(() => {
      ChffrPlus.writeParam(param, value);
    }, 0);
  }
}

export function deleteParam(param) {
  return function(dispatch) {
    dispatch({ type: ACTION_PARAM_DELETED, payload: { param }});
    setTimeout(function() {
      ChffrPlus.deleteParam(param);
    }, 0);
  }
}
