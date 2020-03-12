import React, { Component } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import ChffrPlus from '../../native/ChffrPlus';
import { Params } from '../../config';

import {
    deleteParam,
    refreshParams,
    updateParam,
} from '../../store/params/actions';

import X from '../../themes';
import Styles from './DragonpilotSettingsStyles';

// i18n
import { i18n } from '../../utils/I18n'
import { t, Trans } from "@lingui/macro"

const SettingsRoutes = {
    PRIMARY: 'PRIMARY',
    SAFETY: 'SAFETY',
    UI: 'UI',
    APP: 'APP',
    BRANDSPECIFIC: 'BRANDSPECIFIC',
    // HONDA: 'HONDA',
}

const Icons = {
    developer: require('../../img/icon_shell.png'),
    plus: require('../../img/icon_plus.png'),
    minus: require('../../img/icon_minus.png'),
    monitoring: require('../../img/icon_monitoring.png'),
}

class DragonpilotSettings extends Component {
    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);

        this.state = {
            route: SettingsRoutes.PRIMARY,
            expandedCell: null,
            steeringMonitorTimerInt: '3',
            cameraOffsetInt: '6',
            autoShutdownAtInt: '0',
            VolumeBoost: '0',
            carModel: '',
            altAccelProfileInt: 0,
        }
    }

    async componentWillMount() {
        await this.props.refreshParams();
        const {
            params: {
                DragonSteeringMonitorTimer: dragonSteeringMonitorTimer,
                DragonCameraOffset: dragonCameraOffset,
                DragonAutoShutdownAt: dragonAutoShutdownAt,
                DragonUIVolumeBoost: dragonUIVolumeBoost,
                DragonCarModel: dragonCarModel,
                DragonAccelProfile: dragonAccelProfile,
            },
        } = this.props;
        this.setState({ steeringMonitorTimerInt: dragonSteeringMonitorTimer === '0'? 0 : parseInt(dragonSteeringMonitorTimer) || 3 })
        this.setState({ cameraOffsetInt: dragonCameraOffset === '0'? 0 : parseInt(dragonCameraOffset) || 6 })
        this.setState({ autoShutdownAtInt: dragonAutoShutdownAt === '0'? 0 : parseInt(dragonAutoShutdownAt) || 0 })
        this.setState({ VolumeBoostInt: dragonUIVolumeBoost === '0'? 0 : parseInt(dragonUIVolumeBoost) || 0 })
        this.setState({ carModel: dragonCarModel })
        this.setState({ accelProfileInt: dragonAccelProfile === '1'? 1 : dragonAccelProfile === '-1'? -1 : 0 })
    }

    handleExpanded(key) {
        const { expandedCell } = this.state;
        return this.setState({
            expandedCell: expandedCell == key ? null : key,
        })
    }

    handleChangedAccelProfile(operator) {
      const { accelProfileInt } = this.state;
      let _accelProfile;
      switch (operator) {
        case 'increment':
          _accelProfile = Math.min(1, accelProfileInt + 1);
          break;
        case 'decrement':
          _accelProfile = Math.max(-1, accelProfileInt - 1);
          break;
      }
      this.setState({ accelProfileInt: _accelProfile });
      this.props.setAccelProfile(_accelProfile);
    }

    handlePressedBack() {
        const { route } = this.state;
        if (route == SettingsRoutes.PRIMARY) {
            ChffrPlus.sendBroadcast("ai.comma.plus.offroad.NAVIGATED_FROM_SETTINGS");
            this.props.navigateHome();
        } else {
            this.handleNavigatedFromMenu(SettingsRoutes.PRIMARY);
        }
    }

    handleNavigatedFromMenu(route) {
        this.setState({ route: route })
        this.refs.settingsScrollView.scrollTo({ x: 0, y: 0, animated: false })
        this.props.refreshParams();
    }

    handleChangedSteeringMonitorTimer(operator) {
        const { steeringMonitorTimerInt } = this.state;
        let _steeringMonitorTimer;
        switch (operator) {
          case 'increment':
              _steeringMonitorTimer = steeringMonitorTimerInt + 1;
              break;
          case 'decrement':
              _steeringMonitorTimer = Math.max(1, steeringMonitorTimerInt - 1);
              break;
        }
        this.setState({ steeringMonitorTimerInt: _steeringMonitorTimer });
        this.props.setSteeringMonitorTimer(_steeringMonitorTimer);
    }

    handleChangedCameraOffset(operator) {
        const { cameraOffsetInt } = this.state;
        let _cameraOffset;
        switch (operator) {
            case 'increment':
                _cameraOffset = cameraOffsetInt + 1;
                break;
            case 'decrement':
                _cameraOffset = cameraOffsetInt - 1;
                break;
        }
        this.setState({ cameraOffsetInt: _cameraOffset });
        this.props.setCameraOffset(_cameraOffset);
    }

    handleChangedAutoShutdownAt(operator) {
        const { autoShutdownAtInt } = this.state;
        let _autoShutdownAt;
        switch (operator) {
            case 'increment':
                _autoShutdownAt = autoShutdownAtInt + 1;
                break;
            case 'decrement':
                _autoShutdownAt = Math.max(1, autoShutdownAtInt - 1);
                break;
        }
        this.setState({ autoShutdownAtInt: _autoShutdownAt });
        this.props.setAutoShutdown(_autoShutdownAt);
    }

    handleChangedVolumeBoost(operator) {
        const { VolumeBoostInt } = this.state;
        let _VolumeBoost;
        switch (operator) {
            case 'increment':
                _VolumeBoost = Math.min(100, VolumeBoostInt + 10);
                break;
            case 'decrement':
                _VolumeBoost = Math.max(-100, VolumeBoostInt - 10);
                break;
        }
        this.setState({ VolumeBoostInt: _VolumeBoost });
        this.props.setVolumeBoost(_VolumeBoost);
    }

    handlePressedUpdatePanda = async () => {
        Alert.alert(i18n._(t`Update Panda Firmware`), i18n._(t`Your EON will reboot once completed please DO NOT disconnect panda from power source, manual restart them if nothing happened after 3 minutes.`), [
            { text: i18n._(t`Later`), onPress: () => {}, style: 'cancel' },
            { text: i18n._(t`Update and Reboot`), onPress: () => ChffrPlus.updatePandaFirmware() },
        ]);
    }


    handleRunApp(app, val) {
        switch (app) {
            case 'mixplorer':
                this.props.runMixplorer(val);
                break;
            case 'waze':
                this.props.runWaze(val);
                break;
        }
    }

    renderSettingsMenu() {
        const settingsMenuItems = [
            {
                icon: Icons.developer,
                title: i18n._(t`Safety`),
                context: i18n._(t`Settings`),
                route: SettingsRoutes.SAFETY,
            },
            {
                icon: Icons.developer,
                title: i18n._(t`UI`),
                context: i18n._(t`Settings`),
                route: SettingsRoutes.UI,
            },
            {
                icon: Icons.developer,
                title: i18n._(t`3rd Party Apps`),
                context: i18n._(t`Settings`),
                route: SettingsRoutes.APP,
            },
            {
                icon: Icons.developer,
                title: i18n._(t`Brand Specific`),
                context: i18n._(t`Settings`),
                route: SettingsRoutes.BRANDSPECIFIC,
            },
        ];
        return settingsMenuItems.map((item, idx) => {
            const cellButtonStyle = [
                Styles.settingsMenuItem,
                idx == 1 ? Styles.settingsMenuItemBorderless : null,
            ]
            return (
                <View key={ idx } style={ cellButtonStyle }>
                    <X.Button
                        color='transparent'
                        size='full'
                        style={ Styles.settingsMenuItemButton }
                        onPress={ () => this.handleNavigatedFromMenu(item.route) }>
                        <X.Image
                            source={ item.icon }
                            style={ Styles.settingsMenuItemIcon } />
                        <X.Text
                            color='white'
                            size='small'
                            weight='semibold'
                            style={ Styles.settingsMenuItemTitle }>
                            { item.title }
                        </X.Text>
                        <X.Text
                            color='white'
                            size='tiny'
                            weight='light'
                            style={ Styles.settingsMenuItemContext }>
                            { item.context }
                        </X.Text>
                    </X.Button>
                </View>
            )
        })
    }

    renderPrimarySettings() {
        const {
            params: {
                DragonBootHotspot: dragonBootHotspot,
                DragonEnableLogger: dragonEnableLogger,
                DragonEnableUploader: dragonEnableUploader,
                DragonEnableDashcam: dragonEnableDashcam,
                DragonNoctuaMode: dragonNoctuaMode,
                DragonCacheCar: dragonCacheCar,
                DragonChargingCtrl: dragonChargingCtrl,
                DragonEnableSRLearner: dragonEnableSRLearner,
                DragonEnableAutoShutdown: dragonEnableAutoShutdown,
                // for state only
                DragonWazeMode: dragonWazeMode,
                DragonEnableMixplorer: dragonEnableMixplorer,
            }
        } = this.props;
        const { expandedCell, cameraOffsetInt, autoShutdownAtInt, carModel, accelProfileInt } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        { i18n._(t`<  dragonpilot Settings`) }
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Table direction='row' color='darkBlue'>
                        { this.renderSettingsMenu() }
                    </X.Table>
                    {dragonWazeMode === '1' &&
                    <X.Table color='darkBlue'>
                        <X.Button
                            color='settingsDefault'
                            onPress={() => this.handleRunApp('waze', '1')}>
                            { i18n._(t`Open Waze`) }
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini'/>
                        <X.Button
                            color='settingsDefault'
                            onPress={() => this.handleRunApp('waze', '-1')}>
                            { i18n._(t`Close Waze`) }
                        </X.Button>
                    </X.Table>
                    }
                    {dragonEnableMixplorer === '1' &&
                    <X.Table color='darkBlue'>
                        <X.Button
                            color='settingsDefault'
                            onPress={() => this.handleRunApp('mixplorer', '1')}>
                            { i18n._(t`MiXplorer File Manager`) }
                        </X.Button>
                    </X.Table>
                    }
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            title={ i18n._(t`Services`) }
                            value='' />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Logger`) }
                            value={ !!parseInt(dragonEnableLogger) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`If you disable logger (loggered/tombstoned), it will stop recording driving data for AI training, reboot required.`) }
                            isExpanded={ expandedCell == 'enable_logger' }
                            handleExpanded={ () => this.handleExpanded('enable_logger') }
                            handleChanged={ this.props.setEnableLogger } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Uploader`) }
                            value={ !!parseInt(dragonEnableUploader) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`If you disable uploader, it will stop uploading driving data for AI training, reboot required.`) }
                            isExpanded={ expandedCell == 'enable_uploader' }
                            handleExpanded={ () => this.handleExpanded('enable_uploader') }
                            handleChanged={ this.props.setEnableUploader } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Dashcam`) }
                            value={ !!parseInt(dragonEnableDashcam) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Record EON screen as dashcam footage, it will automatically delete old footage if the available space is less than 15%, footage will be stored in /sdcard/dashcam/.`) }
                            isExpanded={ expandedCell == 'dashcam' }
                            handleExpanded={ () => this.handleExpanded('dashcam') }
                            handleChanged={ this.props.setEnableDashcam } />
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            title={ i18n._(t`Hardware`) }
                            value='' />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Hotspot on Boot`) }
                            value={ !!parseInt(dragonBootHotspot) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`If you enable this, Hotspot will turn on automatically on boot.`) }
                            isExpanded={ expandedCell == 'boot_hotspot' }
                            handleExpanded={ () => this.handleExpanded('boot_hotspot') }
                            handleChanged={ this.props.setBootHotspot } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Auto Shutdown`) }
                            value={ !!parseInt(dragonEnableAutoShutdown) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this if you wish to shutdown your device automatically. (not suitable for comma power users)`) }
                            isExpanded={ expandedCell == 'auto_shutdown' }
                            handleExpanded={ () => this.handleExpanded('auto_shutdown') }
                            handleChanged={ this.props.setEnableAutoShutdown } />
                        {dragonEnableAutoShutdown === '1' &&
                        <X.TableCell
                            type='custom'
                            title={i18n._(t`Auto Shutdown (min)`)}
                            iconSource={Icons.developer}
                            description={i18n._(t`Adjust the shutdown timer to shutdown your device after a period of time.`)}
                            isExpanded={expandedCell == 'auto_shutdown_timer'}
                            handleExpanded={() => this.handleExpanded('auto_shutdown_timer')}>
                            <X.Button
                                color='ghost'
                                activeOpacity={1}
                                style={Styles.settingsPlusMinus}>
                                <X.Button
                                    style={[Styles.settingsNumericButton, {opacity: autoShutdownAtInt <= 1 ? 0.1 : 0.8}]}
                                    onPress={() => this.handleChangedAutoShutdownAt('decrement')}>
                                    <X.Image
                                        source={Icons.minus}
                                        style={Styles.settingsNumericIcon}/>
                                </X.Button>
                                <X.Text
                                    color='white'
                                    weight='semibold'
                                    style={ Styles.settingsNumericValue }>
                                    { autoShutdownAtInt <= 0? i18n._(t`OFF`) : autoShutdownAtInt }
                                </X.Text>
                                <X.Button
                                    style={[Styles.settingsNumericButton, {opacity: 0.8}]}
                                    onPress={() => this.handleChangedAutoShutdownAt('increment')}>
                                    <X.Image
                                        source={Icons.plus}
                                        style={Styles.settingsNumericIcon}/>
                                </X.Button>
                            </X.Button>
                        </X.TableCell>
                        }
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Noctua Fan Mode`) }
                            value={ !!parseInt(dragonNoctuaMode) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this will let the fan running at full speed at any temperature, reboot required.`) }
                            isExpanded={ expandedCell == 'enable_noctua_mode' }
                            handleExpanded={ () => this.handleExpanded('enable_noctua_mode') }
                            handleChanged={ this.props.setNoctuaMode } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Charging Control`) }
                            value={ !!parseInt(dragonChargingCtrl) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`If you turn this on, dp will try to keep your battery level between 60%~70% to protect your battery.`) }
                            isExpanded={ expandedCell == 'charging_ctrl' }
                            handleExpanded={ () => this.handleExpanded('charging_ctrl') }
                            handleChanged={ this.props.setChargingCtrl} />
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            title={ i18n._(t`Tuning`) }
                            value='' />
                        <X.TableCell
                            type='custom'
                            title={ i18n._(t`Camera Offset (cm)`) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Adjust the camera offset if your car is not centered, slowly increase this if your car is close to the right, slowly decrease this if your car is close to the left, default is 6 cm.`) }
                            isExpanded={ expandedCell == 'camera_offset' }
                            handleExpanded={ () => this.handleExpanded('camera_offset') }>
                            <X.Button
                                color='ghost'
                                activeOpacity={ 1 }
                                style={ Styles.settingsPlusMinus }>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: 0.8 }] }
                                    onPress={ () => this.handleChangedCameraOffset('decrement')  }>
                                    <X.Image
                                        source={ Icons.minus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                                <X.Text
                                    color='white'
                                    weight='semibold'
                                    style={ Styles.settingsNumericValue }>
                                    { cameraOffsetInt }
                                </X.Text>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: 0.8 }] }
                                    onPress={ () => this.handleChangedCameraOffset('increment') }>
                                    <X.Image
                                        source={ Icons.plus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                            </X.Button>
                        </X.TableCell>
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Cache Fingerprint`) }
                            value={ !!parseInt(dragonCacheCar) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this to store your fingerprint/vin/car model into files and use it when required, this will reduce the car model detection time, disable this if you put EON onto another car, reboot required.`) }
                            isExpanded={ expandedCell == 'cache_fingerprint' }
                            handleExpanded={ () => this.handleExpanded('cache_fingerprint') }
                            handleChanged={ this.props.setCacheCar } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Steer Ratio Learner`) }
                            value={ !!parseInt(dragonEnableSRLearner) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this to turn on steer ratio learner, We DO NOT RECOMMEND that you turn on this unless you know what you are doing.`) }
                            isExpanded={ expandedCell == 'sr_learner' }
                            handleExpanded={ () => this.handleExpanded('sr_learner') }
                            handleChanged={ this.props.setSRLeaner } />
                        <X.TableCell
                            type='custom'
                            title={ i18n._(t`Acceleration Profile`) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Adjust the acceleration profile, choice of ECO / NORMAL / SPORT`) }
                            isExpanded={ expandedCell == 'accel_profile' }
                            handleExpanded={ () => this.handleExpanded('accel_profile') }>
                            <X.Button
                                color='ghost'
                                activeOpacity={ 1 }
                                style={ Styles.settingsPlusMinus }>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: accelProfileInt <= -1? 0.1 : 0.8 }] }
                                    onPress={ () => this.handleChangedAccelProfile('decrement')  }>
                                    <X.Image
                                        source={ Icons.minus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                                <X.Text
                                    color='white'
                                    weight='semibold'
                                    style={ Styles.settingsNumericValue }>
                                    { i18n._(accelProfileInt === -1? t`ECO` : accelProfileInt === 0? t`NORMAL` : t`SPORT`) }
                                </X.Text>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: accelProfileInt >= 1? 0.1 : 0.8 }] }
                                    onPress={ () => this.handleChangedAccelProfile('increment') }>
                                    <X.Image
                                        source={ Icons.plus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                            </X.Button>
                        </X.TableCell>
                    </X.Table>
                    <X.Table color='darkBlue' padding='big'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ () => ChffrPlus.openAndroidSettings() }>
                            { i18n._(t`Open Android Settings`) }
                        </X.Button>
                    </X.Table>
                    <X.Table color='darkBlue' padding='big'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ this.handlePressedUpdatePanda  }>
                            { i18n._(t`Update Panda Firmware`) }
                        </X.Button>
                    </X.Table>
                    <X.Table spacing='none'>
                        <X.TableCell
                            title={ i18n._(t`Car Model`) }
                            value={ carModel }
                            valueTextSize='tiny' />
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderSafetySettings() {
        const {
            params: {
                DragonLatCtrl: dragonLatCtrl,
                DragonAllowGas: dragonAllowGas,
                DragonEnableSteeringOnSignal: dragonEnableSteeringOnSignal,
                DragonEnableDriverSafetyCheck: dragonEnableDriverSafetyCheck,
                DragonDisplaySteeringLimitAlert: dragonDisplaySteeringLimitAlert,
                DragonEnableDriverMonitoring: dragonEnableDriverMonitoring,
                DragonEnableSlowOnCurve: dragonEnableSlowOnCurve,
                DragonEnableLeadCarMovingAlert: dragonEnableLeadCarMovingAlert,
                DragonEnableAutoLC: dragonEnableAutoLC,
            },
        } = this.props;
        const { expandedCell, steeringMonitorTimerInt } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        { i18n._(t`<  Safety Settings`) }
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            title={ i18n._(t`Lateral Control`) }
                            value='' />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Lateral Control`) }
                            value={ !!parseInt(dragonLatCtrl) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this if you wish dp to control the steering for you.`) }
                            isExpanded={ expandedCell == 'lat_ctrl' }
                            handleExpanded={ () => this.handleExpanded('lat_ctrl') }
                            handleChanged={ this.props.setLatCtrl } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Steering On Signal`) }
                            value={ !!parseInt(dragonEnableSteeringOnSignal) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`If you enable this, it will temporary disable steering control when left/right blinker is on and resume control 1 second after the blinker is off.`) }
                            isExpanded={ expandedCell == 'enable_steering_on_signal' }
                            handleExpanded={ () => this.handleExpanded('enable_steering_on_signal') }
                            handleChanged={ this.props.setEnableSteeringOnSignal } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display "Turn Exceeds Steering Limit" Alert`) }
                            value={ !!parseInt(dragonDisplaySteeringLimitAlert) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`If you disable this, you will not receive any "Turn Exceeds Steering Limit" alerts on the screen. Hyundai, Ford, Toyota do not have this alert.`) }
                            isExpanded={ expandedCell == 'display_steering_limit_alert' }
                            handleExpanded={ () => this.handleExpanded('display_steering_limit_alert') }
                            handleChanged={ this.props.setDisplaySteeringLimitAlert } />
                        <X.TableCell
                            type='switch'
                            title={i18n._(t`Enable Auto Lane Change`)}
                            value={!!parseInt(dragonEnableAutoLC)}
                            iconSource={Icons.developer}
                            description={i18n._(t`If you enable this, dp will change lane for you once the speed is above 60mph / 97kph. We DO NOT RECOMMEND that you turn on this unless you know what you are doing, we hold no responsibility if you enable this option.`)}
                            isExpanded={expandedCell == 'enable_auto_lc'}
                            handleExpanded={() => this.handleExpanded('enable_auto_lc')}
                            handleChanged={ this.props.setEnableAutoLC }/>
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            title={ i18n._(t`Longitudinal Control`) }
                            value='' />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Allow Gas`) }
                            value={ !!parseInt(dragonAllowGas) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this if you wish to use gas on engaged.`) }
                            isExpanded={ expandedCell == 'allow_gas' }
                            handleExpanded={ () => this.handleExpanded('allow_gas') }
                            handleChanged={ this.props.setAllowGas } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Slow on Curve`) }
                            value={ !!parseInt(dragonEnableSlowOnCurve) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`If you enable this, the car will slow down automatically when on a curve road, this feature only works on Long Ctrl supported cars.`) }
                            isExpanded={ expandedCell == 'enable_slow_on_curve' }
                            handleExpanded={ () => this.handleExpanded('enable_slow_on_curve') }
                            handleChanged={ this.props.setEnableSlowOnCurve } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Lead Car Moving Alert (BETA)`) }
                            value={ !!parseInt(dragonEnableLeadCarMovingAlert) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`If you enable this, dp will notify you when lead car starts moving from stationary.`) }
                            isExpanded={ expandedCell == 'enable_lead_car_alert' }
                            handleExpanded={ () => this.handleExpanded('enable_lead_car_alert') }
                            handleChanged={ this.props.setEnableLeadCarMovingAlert } />
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            title={ i18n._(t`Safety Monitors`) }
                            value='' />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Safety Check`) }
                            value={ !!parseInt(dragonEnableDriverSafetyCheck) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`If you disable this, the driver safety check will be disabled completely, we DO NOT RECOMMEND that you turn off this unless you know what you are doing, we hold no responsibility if you disable this option.`) }
                            isExpanded={ expandedCell == 'safetyCheck' }
                            handleExpanded={ () => this.handleExpanded('safetyCheck') }
                            handleChanged={ this.props.setEnableDriverSafetyCheck } />
                        {dragonEnableDriverSafetyCheck === '1' &&
                        <X.TableCell
                            type='switch'
                            title={i18n._(t`Enable Driver Monitoring`)}
                            value={!!parseInt(dragonEnableDriverMonitoring)}
                            iconSource={Icons.monitoring}
                            description={i18n._(t`Driver Monitoring detects driver awareness with 3D facial reconstruction and pose estimation. It is used to warn the driver when they appear distracted while openpilot is engaged. This feature is still in beta, so Driver Monitoring is unavailable when the facial tracking is too inaccurate (e.g. at night). The availability is indicated by the face icon at the bottom-left corner of your EON.`)}
                            isExpanded={expandedCell == 'driver_monitoring'}
                            handleExpanded={() => this.handleExpanded('driver_monitoring')}
                            handleChanged={this.props.setEnableDriverMonitoring}/>
                        }
                        {dragonEnableDriverSafetyCheck === '1' &&
                        <X.TableCell
                            type='custom'
                            title={i18n._(t`Steering Monitor Timer`)}
                            iconSource={Icons.developer}
                            description={i18n._(t`Adjust the steering monitor timer, set this to "OFF" if you would like to disable steering monitor. Default is 3 minutes.`)}
                            isExpanded={expandedCell == 'steering_monitor_timer'}
                            handleExpanded={() => this.handleExpanded('steering_monitor_timer')}>
                            <X.Button
                                color='ghost'
                                activeOpacity={1}
                                style={Styles.settingsPlusMinus}>
                                <X.Button
                                    style={[Styles.settingsNumericButton, {opacity: steeringMonitorTimerInt <= 1 ? 0.1 : 0.8}]}
                                    onPress={() => this.handleChangedSteeringMonitorTimer('decrement')}>
                                    <X.Image
                                        source={Icons.minus}
                                        style={Styles.settingsNumericIcon}/>
                                </X.Button>
                                <X.Text
                                    color='white'
                                    weight='semibold'
                                    style={ Styles.settingsNumericValue }>
                                    { steeringMonitorTimerInt <= 0? i18n._(t`OFF`) : steeringMonitorTimerInt }
                                </X.Text>
                                <X.Button
                                    style={[Styles.settingsNumericButton, {opacity: 0.8}]}
                                    onPress={() => this.handleChangedSteeringMonitorTimer('increment')}>
                                    <X.Image
                                        source={Icons.plus}
                                        style={Styles.settingsNumericIcon}/>
                                </X.Button>
                            </X.Button>
                        </X.TableCell>
                        }
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderAPPSettings() {
        const {
            params: {
                DragonEnableTomTom: dragonEnableTomTom,
                DragonBootTomTom: dragonBootTomTom,
                DragonEnableAutonavi: dragonEnableAutonavi,
                DragonBootAutonavi: dragonBootAutonavi,
                DragonEnableAegis: dragonEnableAegis,
                DragonBootAegis: dragonBootAegis,
                DragonEnableMixplorer: dragonEnableMixplorer,
                DragonWazeMode: dragonWazeMode,
                DragonGreyPandaMode: dragonGreyPandaMode,
            },
        } = this.props;
        const { expandedCell } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        { i18n._(t`<  3rd Party Apps Settings`) }
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Use External GPS Signal`) }
                            value={ !!parseInt(dragonGreyPandaMode) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this if you wish to use external GPS signal (Grey Panda/Black Panda/C2 Users only).`) }
                            isExpanded={ expandedCell == 'ext_gps' }
                            handleExpanded={ () => this.handleExpanded('ext_gps') }
                            handleChanged={ this.props.setEnableGreyPandaMode } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Waze Mode`) }
                            value={ !!parseInt(dragonWazeMode) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this if you wish to turn your device into a Waze navigator, NOTE: 1. once this is enabled, tomtom/autonavi will be disabled. 2. Waze will start automatically and you will not be able to change any settings when the car is started. 3. Most driving UI elements will be disabled. 4, Reboot required.`) }
                            isExpanded={ expandedCell == 'enable_waze' }
                            handleExpanded={ () => this.handleExpanded('enable_waze') }
                            handleChanged={ this.props.setEnableWazeMode } />
                        {dragonWazeMode === '0' &&
                        <X.TableCell
                            type='switch'
                            title={i18n._(t`Enable TomTom Safety Camera App`)}
                            value={!!parseInt(dragonEnableTomTom)}
                            iconSource={Icons.developer}
                            description={i18n._(t`Enable this if you wish to use TomTom Safety Camera App, restart required.`)}
                            isExpanded={expandedCell == 'enable_tomtom'}
                            handleExpanded={() => this.handleExpanded('enable_tomtom')}
                            handleChanged={this.props.setEnableTomTom}/>
                        }
                        {dragonWazeMode === '0' && dragonEnableTomTom === '1' &&
                            <X.TableCell
                            type='switch'
                            title={i18n._(t`Auto Run TomTom Safety Camera App`)}
                            value={!!parseInt(dragonBootTomTom)}
                            iconSource={Icons.developer}
                            description={i18n._(t`Enable this will have TomTom Safety Camera App start when car is on, stop when car is off.`)}
                            isExpanded={expandedCell == 'run_tomtom'}
                            handleExpanded={() => this.handleExpanded('run_tomtom')}
                            handleChanged={this.props.setBootTomTom}/>
                        }
                        {dragonWazeMode === '0' &&
                        <X.TableCell
                            type='switch'
                            title={i18n._(t`Enable Autonavi Map App`)}
                            value={!!parseInt(dragonEnableAutonavi)}
                            iconSource={Icons.developer}
                            description={i18n._(t`Enable this if you wish to use Autonavi Map App, restart required.`)}
                            isExpanded={expandedCell == 'enable_autonavi'}
                            handleExpanded={() => this.handleExpanded('enable_autonavi')}
                            handleChanged={this.props.setEnableAutonavi}/>
                        }
                        {dragonWazeMode === '0' && dragonEnableAutonavi === '1' &&
                            <X.TableCell
                            type='switch'
                            title={i18n._(t`Auto Run Autonavi Map`)}
                            value={!!parseInt(dragonBootAutonavi)}
                            iconSource={Icons.developer}
                            description={i18n._(t`Enable this will have Autonavi Map App start when car is on, stop when car is off.`)}
                            isExpanded={expandedCell == 'run_autonavi'}
                            handleExpanded={() => this.handleExpanded('run_autonavi')}
                            handleChanged={this.props.setBootAutonavi}/>
                        }
                        {dragonWazeMode === '0' &&
                        <X.TableCell
                            type='switch'
                            title={i18n._(t`Enable Aegis Safety Camera App`)}
                            value={!!parseInt(dragonEnableAegis)}
                            iconSource={Icons.developer}
                            description={i18n._(t`Enable this if you wish to use Aegis Safety Camera App, restart required.`)}
                            isExpanded={expandedCell == 'enable_aegis'}
                            handleExpanded={() => this.handleExpanded('enable_aegis')}
                            handleChanged={this.props.setEnableAegis}/>
                        }
                        {dragonWazeMode === '0' && dragonEnableAegis === '1' &&
                        <X.TableCell
                            type='switch'
                            title={i18n._(t`Auto Run Aegis Safety Camera App`)}
                            value={!!parseInt(dragonBootAegis)}
                            iconSource={Icons.developer}
                            description={i18n._(t`Enable this will have Aegis Safety Camera App start when car is on, stop when car is off.`)}
                            isExpanded={expandedCell == 'run_aegis'}
                            handleExpanded={() => this.handleExpanded('run_aegis')}
                            handleChanged={this.props.setBootAegis}/>
                        }
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable MiXplorer App`) }
                            value={ !!parseInt(dragonEnableMixplorer) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this if you wish to use MiXplorer file manager App, restart required.`) }
                            isExpanded={ expandedCell == 'enable_mixplorer' }
                            handleExpanded={ () => this.handleExpanded('enable_mixplorer') }
                            handleChanged={ this.props.setEnableMixplorer} />
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderBrandSpecificSettings() {
        const {
            params: {
                DragonToyotaStockDSU: dragonToyotaStockDSU,
                DragonToyotaLaneDepartureWarning: dragonToyotaLaneDepartureWarning,
                DragonToyotaSnGMod: dragonToyotaSnGMod,
            },
        } = this.props;
        const { expandedCell } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        { i18n._(t`<  Brand Specific Settings`) }
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            title={ i18n._(t`Toyota / Lexus`) }
                            value='' />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Stock DSU Mode`) }
                            value={ !!parseInt(dragonToyotaStockDSU) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Some models DSU cannot be unplugged (such as Lexus IS/GS/ES), once this option is enabled, turn on AHB (Auto High Beam) will keep you dp always on for Lat Control (control gas/brake manually), turn off AHB if you want to cancel dp Lat Control.`) }
                            isExpanded={ expandedCell == 'toyota_stock_dsu' }
                            handleExpanded={ () => this.handleExpanded('toyota_stock_dsu') }
                            handleChanged={ this.props.setToyotaStockDSU } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Lane Departure Warnings`) }
                            value={ !!parseInt(dragonToyotaLaneDepartureWarning) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this if you wish to receive the factory lane departure warning when crossing lanes. (e.g. vibrate steering wheel)`) }
                            isExpanded={ expandedCell == 'toyota_lane_departure_warning' }
                            handleExpanded={ () => this.handleExpanded('toyota_lane_departure_warning') }
                            handleChanged={ this.props.setToyotaLaneDepartureWarning } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable SnG Mod`) }
                            value={ !!parseInt(dragonToyotaSnGMod) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this if you wish to use Stop n Go mod, the car will ignore acceleration commands if you are on a hill, we DO NOT RECOMMEND that you enable this unless you know what it is. (Only works on cars that need resume button to start)`) }
                            isExpanded={ expandedCell == 'toyota_sng_mod' }
                            handleExpanded={ () => this.handleExpanded('toyota_sng_mod') }
                            handleChanged={ this.props.setToyotaSnGMod } />
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            title={ i18n._(t`Honda`) }
                            value='' />
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    // renderHondaSettings() {
    //     const { expandedCell } = this.state;
    //     return (
    //         <View style={ Styles.settings }>
    //             <View style={ Styles.settingsHeader }>
    //                 <X.Button
    //                     color='ghost'
    //                     size='small'
    //                     onPress={ () => this.handlePressedBack() }>
    //                     { i18n._(t`<  Honda Settings`) }
    //                 </X.Button>
    //             </View>
    //             <ScrollView
    //                 ref="settingsScrollView"
    //                 style={ Styles.settingsWindow }>
    //                 <View>
    //                     <X.Table>
    //                         <X.TableCell
    //                             title={ i18n._(t`Device Paired`) }
    //                             value='Yes' />
    //                     </X.Table>
    //                 </View>
    //             </ScrollView>
    //         </View>
    //     )
    // }

    renderUISettings() {
        const {
            params: {
                DragonDrivingUI: dragonDrivingUI,
                DragonUIEvent: dragonUIEvent,
                DragonUIMaxSpeed: dragonUIMaxSpeed,
                DragonUIFace: dragonUIFace,
                DragonUIDev: dragonUIDev,
                DragonUIDevMini: dragonUIDevMini,
                DragonUISpeed: dragonUISpeed,
                DragonUILane: dragonUILane,
                DragonUILead: dragonUILead,
                DragonUIPath: dragonUIPath,
                DragonUIBlinker: dragonUIBlinker,
                DragonUIDMView: dragonUIDMView,
            },
        } = this.props;
        const { expandedCell, VolumeBoostInt } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        { i18n._(t`<  UI Settings`) }
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display Driving UI`) }
                            value={ !!parseInt(dragonDrivingUI) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Disable this only if you do not want to see the driving UI and its blocking your navigation view, this will also effect what you records in dashcam.`) }
                            isExpanded={ expandedCell == 'driving_ui' }
                            handleExpanded={ () => this.handleExpanded('driving_ui') }
                            handleChanged={ this.props.setDrivingUI } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display Driver Monitor View`) }
                            value={ !!parseInt(dragonUIDMView) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this if you wish to see driver monitor view in Picture-In-Picture style.`) }
                            isExpanded={ expandedCell == 'dm_view' }
                            handleExpanded={ () => this.handleExpanded('dm_view') }
                            handleChanged={ this.props.setDMView } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display Speed`) }
                            value={!!parseInt(dragonUISpeed)}
                            iconSource={Icons.developer}
                            description={ i18n._(t`Enable this to display Speed.`) }
                            isExpanded={expandedCell == 'dragon_ui_speed'}
                            handleExpanded={() => this.handleExpanded('dragon_ui_speed')}
                            handleChanged={this.props.setUISpeed}/>
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display Lane Prediction`) }
                            value={!!parseInt(dragonUILane)}
                            iconSource={Icons.developer}
                            description={ i18n._(t`Enable this to display lane prediction.`) }
                            isExpanded={expandedCell == 'dragon_ui_lane'}
                            handleExpanded={() => this.handleExpanded('dragon_ui_lane')}
                            handleChanged={this.props.setUILane}/>
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display Lead Car Indicator`) }
                            value={!!parseInt(dragonUILead)}
                            iconSource={Icons.developer}
                            description={ i18n._(t`Enable this to display lead car indicator, this only works on supported cars.`) }
                            isExpanded={expandedCell == 'dragon_ui_lead'}
                            handleExpanded={() => this.handleExpanded('dragon_ui_lead')}
                            handleChanged={this.props.setUILead}/>
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display Path Prediction`) }
                            value={!!parseInt(dragonUIPath)}
                            iconSource={Icons.developer}
                            description={ i18n._(t`Enable this to display path prediction.`) }
                            isExpanded={expandedCell == 'dragon_ui_path'}
                            handleExpanded={() => this.handleExpanded('dragon_ui_path')}
                            handleChanged={this.props.setUIPath}/>
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display Turning Signal`) }
                            value={!!parseInt(dragonUIBlinker)}
                            iconSource={Icons.developer}
                            description={ i18n._(t`Enable this to display turning signal.`) }
                            isExpanded={expandedCell == 'dragon_ui_blinker'}
                            handleExpanded={() => this.handleExpanded('dragon_ui_blinker')}
                            handleChanged={this.props.setUIBlinker}/>
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display Event / Steering Icon`) }
                            value={!!parseInt(dragonUIEvent)}
                            iconSource={Icons.developer}
                            description={ i18n._(t`Enable this to display Event / Steering Icon.`) }
                            isExpanded={expandedCell == 'dragon_ui_event'}
                            handleExpanded={() => this.handleExpanded('dragon_ui_event')}
                            handleChanged={this.props.setUIEvent}/>
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display Max Speed`) }
                            value={!!parseInt(dragonUIMaxSpeed)}
                            iconSource={Icons.developer}
                            description={ i18n._(t`Enable this to display Max Speed.`) }
                            isExpanded={expandedCell == 'dragon_ui_maxspeed'}
                            handleExpanded={() => this.handleExpanded('dragon_ui_maxspeed')}
                            handleChanged={this.props.setUIMaxSpeed}/>
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display Face Icon`) }
                            value={ !!parseInt(dragonUIFace) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this to display Face Icon.`) }
                            isExpanded={ expandedCell == 'dragon_ui_face' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_face') }
                            handleChanged={ this.props.setUIFace } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display Dev UI`) }
                            value={ !!parseInt(dragonUIDev) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this to display DevUI found in kegman/arne fork.`) }
                            isExpanded={ expandedCell == 'dragon_ui_dev' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_dev') }
                            handleChanged={ this.props.setUIDev } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Display Mini Dev UI`) }
                            value={ !!parseInt(dragonUIDevMini) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Enable this to display Mini Dev UI designed for dragonpilot.`) }
                            isExpanded={ expandedCell == 'dragon_ui_dev_mini' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_dev_mini') }
                            handleChanged={ this.props.setUIDevMini } />
                        <X.TableCell
                            type='custom'
                            title={ i18n._(t`Boost Audio Alert Volume (%)`) }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Boost audio alert volume in percentage, set to -100 (%) if you would like to disable audio alert. Default is 0 (%).`) }
                            isExpanded={ expandedCell == 'adjust_audio_alert_vol' }
                            handleExpanded={ () => this.handleExpanded('adjust_audio_alert_vol') }>
                            <X.Button
                                color='ghost'
                                activeOpacity={ 1 }
                                style={ Styles.settingsPlusMinus }>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: VolumeBoostInt <= -100? 0.1 : 0.8 }] }
                                    onPress={ () => this.handleChangedVolumeBoost('decrement')  }>
                                    <X.Image
                                        source={ Icons.minus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                                <X.Text
                                    color='white'
                                    weight='semibold'
                                    style={ Styles.settingsNumericValue }>
                                    { VolumeBoostInt }
                                </X.Text>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: VolumeBoostInt >= 100? 0.1 : 0.8 }] }
                                    onPress={ () => this.handleChangedVolumeBoost('increment') }>
                                    <X.Image
                                        source={ Icons.plus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                            </X.Button>
                        </X.TableCell>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderSettingsByRoute() {
        const { route } = this.state;
        switch (route) {
            case SettingsRoutes.PRIMARY:
                return this.renderPrimarySettings();
            case SettingsRoutes.SAFETY:
                return this.renderSafetySettings();
            case SettingsRoutes.BRANDSPECIFIC:
                return this.renderBrandSpecificSettings();
            // case SettingsRoutes.HONDA:
            //     return this.renderHondaSettings();
            case SettingsRoutes.UI:
                return this.renderUISettings();
            case SettingsRoutes.APP:
                return this.renderAPPSettings();
        }
    }

    render() {
        return (
            <X.Gradient color='dark_blue'>
                { this.renderSettingsByRoute() }
            </X.Gradient>
        )
    }
}

const mapStateToProps = state => ({
    params: state.params.params,
});

const mapDispatchToProps = dispatch => ({
    navigateHome: async () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({ routeName: 'Home' })
            ]
        }));
    },
    deleteParam: (param) => {
        dispatch(deleteParam(param));
    },
    refreshParams: () => {
        dispatch(refreshParams());
    },
    // dragonpilot
    setLatCtrl: (latCtrl) => {
        dispatch(updateParam(Params.KEY_LAT_CTRL, (latCtrl | 0).toString()));
    },
    setAllowGas: (allowGas) => {
        dispatch(updateParam(Params.KEY_ALLOW_GAS, (allowGas | 0).toString()));
    },
    setEnableLogger: (enableLogger) => {
        dispatch(updateParam(Params.KEY_ENABLE_LOGGER, (enableLogger | 0).toString()));
    },
    setEnableUploader: (enableUploader) => {
        dispatch(updateParam(Params.KEY_ENABLE_UPLOADER, (enableUploader | 0).toString()));
    },
    setEnableSteeringOnSignal: (enableSteeringOnSignal) => {
        dispatch(updateParam(Params.KEY_ENABLE_STEERING_ON_SIGNAL, (enableSteeringOnSignal | 0).toString()));
    },
    setEnableDashcam: (enableDashcam) => {
        dispatch(updateParam(Params.KEY_ENABLE_DASHCAM, (enableDashcam | 0).toString()));
    },
    setEnableAutoShutdown: (val) => {
        dispatch(updateParam(Params.KEY_ENABLE_AUTO_SHUTDOWN, (val | 0).toString()));
    },
    setEnableDriverSafetyCheck: (enableDriverSafetyCheck) => {
        dispatch(updateParam(Params.KEY_ENABLE_DRIVER_SAFETY_CHECK, (enableDriverSafetyCheck | 0).toString()));
    },
    setAutoShutdown: (autoShutdown) => {
        dispatch(updateParam(Params.KEY_AUTO_SHUTDOWN, (autoShutdown).toString()));
    },
    setNoctuaMode: (noctuaMode) => {
        dispatch(updateParam(Params.KEY_ENABLE_NOCTUA_MODE, (noctuaMode | 0).toString()));
    },
    setCacheCar: (cacheCar) => {
        dispatch(updateParam(Params.KEY_CACHE_CAR, (cacheCar | 0).toString()));
    },
    setToyotaStockDSU: (stockDSU) => {
        dispatch(updateParam(Params.KEY_TOYOTA_STOCK_DSU, (stockDSU | 0).toString()));
    },
    setUISpeed: (val) => {
        dispatch(updateParam(Params.KEY_UI_SPEED, (val | 0).toString()));
    },
    setUIEvent: (val) => {
        dispatch(updateParam(Params.KEY_UI_EVENT, (val | 0).toString()));
    },
    setUIMaxSpeed: (val) => {
        dispatch(updateParam(Params.KEY_UI_MAXSPEED, (val | 0).toString()));
    },
    setUIFace: (val) => {
        dispatch(updateParam(Params.KEY_UI_FACE, (val | 0).toString()));
    },
    setUIDev: (val) => {
        dispatch(updateParam(Params.KEY_UI_DEV, (val | 0).toString()));
    },
    setUIDevMini: (val) => {
        dispatch(updateParam(Params.KEY_UI_DEV_MINI, (val | 0).toString()));
    },
    setEnableTomTom: (val) => {
        dispatch(updateParam(Params.KEY_ENABLE_TOMTOM, (val | 0).toString()));
    },
    setBootTomTom: (val) => {
        dispatch(updateParam(Params.KEY_BOOT_TOMTOM, (val | 0).toString()));
    },
    setEnableAutonavi: (val) => {
        dispatch(updateParam(Params.KEY_ENABLE_AUTONAVI, (val | 0).toString()));
    },
    setBootAutonavi: (val) => {
        dispatch(updateParam(Params.KEY_BOOT_AUTONAVI, (val | 0).toString()));
    },
    setEnableAegis: (val) => {
        dispatch(updateParam(Params.KEY_ENABLE_AEGIS, (val | 0).toString()));
    },
    setBootAegis: (val) => {
        dispatch(updateParam(Params.KEY_BOOT_AEGIS, (val | 0).toString()));
    },
    setEnableMixplorer: (val) => {
        dispatch(updateParam(Params.KEY_ENABLE_MIXPLORER, (val | 0).toString()));
    },
    setSteeringMonitorTimer: (val) => {
        dispatch(updateParam(Params.KEY_STEERING_MONITOR_TIMER, (val).toString()));
    },
    runMixplorer: (val) => {
        dispatch(updateParam(Params.KEY_RUN_MIXPLORER, (val | 0).toString()));
    },
    setCameraOffset: (val) => {
        dispatch(updateParam(Params.KEY_CAMERA_OFFSET, (val).toString()));
    },
    setVolumeBoost: (val) => {
        dispatch(updateParam(Params.KEY_UI_VOLUME_BOOST, (val).toString()));
    },
    setDrivingUI: (val) => {
        dispatch(updateParam(Params.KEY_DRIVING_UI, (val | 0).toString()));
    },
    setDisplaySteeringLimitAlert: (val) => {
        dispatch(updateParam(Params.KEY_DISPLAY_STEERING_LIMIT_ALERT, (val | 0).toString()));
    },
    setChargingCtrl: (val) => {
        dispatch(updateParam(Params.KEY_CHARGING_CTRL, (val | 0).toString()));
    },
    setToyotaLaneDepartureWarning: (val) => {
        dispatch(updateParam(Params.KEY_TOYOTA_LANE_DEPARTURE_WARNING, (val | 0).toString()));
    },
    setUILane: (val) => {
        dispatch(updateParam(Params.KEY_UI_LANE, (val | 0).toString()));
    },
    setUILead: (val) => {
        dispatch(updateParam(Params.KEY_UI_LEAD, (val | 0).toString()));
    },
    setUIPath: (val) => {
        dispatch(updateParam(Params.KEY_UI_PATH, (val | 0).toString()));
    },
    setUIBlinker: (val) => {
        dispatch(updateParam(Params.KEY_UI_BLINKER, (val | 0).toString()));
    },
    setDMView: (val) => {
        dispatch(updateParam(Params.KEY_UI_DM_VIEW, (val | 0).toString()));
    },
    setEnableDriverMonitoring: (val) => {
        dispatch(updateParam(Params.KEY_ENABLE_DRIVER_MONITORING, (val | 0).toString()));
    },
    setEnableSlowOnCurve: (val) => {
        dispatch(updateParam(Params.KEY_ENABLE_SLOW_ON_CURVE, (val | 0).toString()));
    },
    setEnableLeadCarMovingAlert: (val) => {
        dispatch(updateParam(Params.KEY_ENABLE_LEAD_CAR_MOVING_ALERT, (val | 0).toString()));
    },
    setToyotaSnGMod: (val) => {
        dispatch(updateParam(Params.KEY_TOYOTA_SNG_MOD, (val | 0).toString()));
    },
    setEnableWazeMode: (val) => {
        dispatch(updateParam(Params.KEY_WAZE_MODE, (val | 0).toString()));
    },
    runWaze: (val) => {
        dispatch(updateParam(Params.KEY_RUN_WAZE, (val).toString()));
    },
    setEnableAutoLC: (val) => {
        dispatch(updateParam(Params.KEY_AUTO_LC, (val | 0).toString()));
    },
    setBootHotspot: (val) => {
        dispatch(updateParam(Params.KEY_BOOT_HOTSPOT, (val | 0).toString()));
    },
    setSRLeaner: (val) => {
        dispatch(updateParam(Params.KEY_SR_LEARNER, (val | 0).toString()));
    },
    setAccelProfile: (val) => {
        dispatch(updateParam(Params.KEY_ACCEL_PROFILE, (val | 0).toString()));
    },
    setEnableGreyPandaMode: (val) => {
        dispatch(updateParam(Params.KEY_GREY_PANDA_MODE, (val | 0).toString()));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(DragonpilotSettings);
