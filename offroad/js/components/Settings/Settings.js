import React, { Component } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    TextInput,
    View,
} from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import ChffrPlus from '../../native/ChffrPlus';
import UploadProgressTimer from '../../timers/UploadProgressTimer';
import { formatSize } from '../../utils/bytes';
import { mpsToKph, mpsToMph, kphToMps, mphToMps } from '../../utils/conversions';
import { Params } from '../../config';
import { resetToLaunch } from '../../store/nav/actions';

import {
    updateSshEnabled,
} from '../../store/host/actions';
import {
    deleteParam,
    updateParam,
    refreshParams,
} from '../../store/params/actions';

import X from '../../themes';
import Styles from './SettingsStyles';

// i18n
import { i18n } from '../../utils/I18n'
import { t, Trans } from "@lingui/macro"

const SettingsRoutes = {
    PRIMARY: 'PRIMARY',
    ACCOUNT: 'ACCOUNT',
    DEVICE: 'DEVICE',
    NETWORK: 'NETWORK',
    DEVELOPER: 'DEVELOPER',
}

const Icons = {
    user: require('../../img/icon_user.png'),
    developer: require('../../img/icon_shell.png'),
    warning: require('../../img/icon_warning.png'),
    metric: require('../../img/icon_metric.png'),
    network: require('../../img/icon_network.png'),
    eon: require('../../img/icon_eon.png'),
    calibration: require('../../img/icon_calibration.png'),
    speedLimit: require('../../img/icon_speed_limit.png'),
    plus: require('../../img/icon_plus.png'),
    minus: require('../../img/icon_minus.png'),
    mapSpeed: require('../../img/icon_map.png'),
    openpilot: require('../../img/icon_openpilot.png'),
}

class Settings extends Component {
    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);

        this.state = {
            route: SettingsRoutes.PRIMARY,
            expandedCell: null,
            version: {
                versionString: '',
                gitBranch: null,
                gitRevision: null,
            },
            speedLimitOffsetInt: '0',
            githubUsername: '',
            authKeysUpdateState: null,
            enableTomTom: false,
            enableAutonavi: false,
            enableAegis: false,
        }

        this.writeSshKeys = this.writeSshKeys.bind(this);
        this.toggleExpandGithubInput = this.toggleExpandGithubInput.bind(this);
    }

    async componentWillMount() {
        UploadProgressTimer.start(this.props.dispatch);
        await this.props.refreshParams();
        const {
            isMetric,
            params: {
                SpeedLimitOffset: speedLimitOffset,
                DragonEnableTomTom: dragonEnableTomTom,
                DragonEnableAutonavi: dragonEnableAutonavi,
                DragonEnableAegis: dragonEnableAegis,
                DragonWazeMode: dragonWazeMode,
            },
        } = this.props;

        this.setState({ enableTomTom: dragonWazeMode === '0' && dragonEnableTomTom === '1' })
        this.setState({ enableAutonavi: dragonWazeMode === '0' && dragonEnableAutonavi === '1' })
        this.setState({ enableAegis: dragonWazeMode === '0' && dragonEnableAegis === '1' })
        if (isMetric) {
            this.setState({ speedLimitOffsetInt: parseInt(mpsToKph(speedLimitOffset)) })
        } else {
            this.setState({ speedLimitOffsetInt: parseInt(mpsToMph(speedLimitOffset)) })
        }
    }

    componentWillUnmount() {
        UploadProgressTimer.stop();
    }

    handleExpanded(key) {
        const { expandedCell } = this.state;
        return this.setState({
            expandedCell: expandedCell == key ? null : key,
        })
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

    handlePressedResetCalibration = async () => {
        this.props.deleteParam(Params.KEY_CALIBRATION_PARAMS);
        this.setState({ calibration: null });
        Alert.alert(i18n._(t`Reboot`), i18n._(t`Resetting calibration requires a reboot.`), [
            { text: i18n._(t`Later`), onPress: () => {}, style: 'cancel' },
            { text: i18n._(t`Reboot Now`), onPress: () => ChffrPlus.reboot() },
        ]);
    }

    handleRunApp(app, val) {
        switch (app) {
            case 'tomtom':
                this.props.runTomTom(val);
                break;
            case 'autonavi':
                this.props.runAutonavi(val);
                break;
            case 'aegis':
                this.props.runAegis(val);
                break;
        }
    }

    // handleChangedSpeedLimitOffset(operator) {
    //     const { speedLimitOffset, isMetric } = this.props;
    //     let _speedLimitOffset;
    //     let _speedLimitOffsetInt;
    //     switch (operator) {
    //       case 'increment':
    //           if (isMetric) {
    //               _speedLimitOffset = kphToMps(Math.max(Math.min(speedLimitOffsetInt + 1, 25), -15));
    //               _speedLimitOffsetInt = Math.round(mpsToKph(_speedLimitOffset));
    //           } else {
    //               _speedLimitOffset = mphToMps(Math.max(Math.min(speedLimitOffsetInt + 1, 15), -10));
    //               _speedLimitOffsetInt = Math.round(mpsToMph(_speedLimitOffset));
    //           }
    //           break;
    //       case 'decrement':
    //           if (isMetric) {
    //               _speedLimitOffset = kphToMps(Math.max(Math.min(speedLimitOffsetInt - 1, 25), -15));
    //               _speedLimitOffsetInt = Math.round(mpsToKph(_speedLimitOffset));
    //           } else {
    //               _speedLimitOffset = mphToMps(Math.max(Math.min(speedLimitOffsetInt - 1, 15), -10));
    //               _speedLimitOffsetInt = Math.round(mpsToMph(_speedLimitOffset));
    //           }
    //           break;
    //     }
    //     this.setState({ speedLimitOffsetInt: _speedLimitOffsetInt });
    //     this.props.setSpeedLimitOffset(_speedLimitOffset);
    // }

    // handleChangedIsMetric() {
    //     const { isMetric, speedLimitOffset } = this.props;
    //     const { speedLimitOffsetInt } = this.state;
    //     if (isMetric) {
    //         this.setState({ speedLimitOffsetInt: parseInt(mpsToMph(speedLimitOffset)) })
    //         this.props.setMetric(false);
    //     } else {
    //         this.setState({ speedLimitOffsetInt: parseInt(mpsToKph(speedLimitOffset)) })
    //         this.props.setMetric(true);
    //     }
    // }

    renderSettingsMenu() {
        const {
            isPaired,
            wifiState,
            simState,
            freeSpace,
            params: {
                Passive: isPassive,
                Version: version,
            },
        } = this.props;
        const software = !!parseInt(isPassive) ? 'chffrplus' : 'openpilot';
        let connectivity = 'Disconnected'
        if (wifiState.isConnected && wifiState.ssid) {
            connectivity = wifiState.ssid;
        } else if (simState.networkType && simState.networkType != 'NO SIM') {
            connectivity = simState.networkType;
        }
        const settingsMenuItems = [
            {
                icon: Icons.user,
                title: i18n._(t`Account`),
                context: i18n._(isPaired ? t`Paired` : t`Unpaired`),
                route: SettingsRoutes.ACCOUNT,
            },
            {
                icon: Icons.eon,
                title: i18n._(t`Device`),
                context: i18n._(t`${ parseInt(freeSpace) + '%' } Free`),
                route: SettingsRoutes.DEVICE,
            },
            {
                icon: Icons.network,
                title: i18n._(t`Network`),
                context: connectivity,
                route: SettingsRoutes.NETWORK,
            },
            {
                icon: Icons.developer,
                title: i18n._(t`Developer`),
                context: `${ software } v${ version.split('-')[0] }`,
                route: SettingsRoutes.DEVELOPER,
            },
        ];
        return settingsMenuItems.map((item, idx) => {
            const cellButtonStyle = [
              Styles.settingsMenuItem,
              idx == 3 ? Styles.settingsMenuItemBorderless : null,
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
                RecordFront: recordFront,
                IsMetric: isMetric,
                LongitudinalControl: hasLongitudinalControl,
                LimitSetSpeed: limitSetSpeed,
                SpeedLimitOffset: speedLimitOffset,
                OpenpilotEnabledToggle: openpilotEnabled,
                Passive: isPassive,
                IsLdwEnabled: isLaneDepartureWarningEnabled,
                LaneChangeEnabled: laneChangeEnabled,
            }
        } = this.props;
        const { expandedCell, speedLimitOffsetInt, enableTomTom, enableAutonavi, enableAegis } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {i18n._(t`<  Settings`)}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Table direction='row' color='darkBlue'>
                        { this.renderSettingsMenu() }
                    </X.Table>
                    {enableTomTom &&
                    <X.Table color='darkBlue'>
                        <X.Button
                            color='settingsDefault'
                            onPress={() => this.handleRunApp('tomtom', '1')}>
                            { i18n._(t`Open TomTom Safety Camera`) }
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini'/>
                        <X.Button
                            color='settingsDefault'
                            onPress={() => this.handleRunApp('tomtom', '-1')}>
                            { i18n._(t`Close TomTom Safety Camera`) }
                        </X.Button>
                    </X.Table>
                    }
                    {enableAutonavi &&
                    <X.Table color='darkBlue'>
                        <X.Button
                            color='settingsDefault'
                            onPress={() => this.handleRunApp('autonavi', '1')}>
                            { i18n._(t`Open AutoNavi Map`) }
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini'/>
                        <X.Button
                            color='settingsDefault'
                            onPress={() => this.handleRunApp('autonavi', '-1')}>
                            { i18n._(t`Close AutoNavi Map`) }
                        </X.Button>
                    </X.Table>
                    }
                    {enableAegis &&
                    <X.Table color='darkBlue'>
                        <X.Button
                            color='settingsDefault'
                            onPress={() => this.handleRunApp('aegis', '1')}>
                            { i18n._(t`Open Aegis Safety Camera`) }
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini'/>
                        <X.Button
                            color='settingsDefault'
                            onPress={() => this.handleRunApp('aegis', '-1')}>
                            { i18n._(t`Close Aegis Safety Camera`) }
                        </X.Button>
                    </X.Table>
                    }
                    <X.Table color='darkBlue'>
                        <X.Button
                            color='settingsDefault'
                            onPress={ () => this.props.openDragonpilotSettings() }>
                            { i18n._(t`dragonpilot`) }
                        </X.Button>
                    </X.Table>
                    <X.Table color='darkBlue'>
                        { !parseInt(isPassive) ? (
                            <X.TableCell
                                type='switch'
                                title={ i18n._(t`Enable openpilot`) }
                                value={ !!parseInt(openpilotEnabled) }
                                iconSource={ Icons.openpilot }
                                description={ i18n._(t`Use the openpilot system for adaptive cruise control and lane keep driver assistance. Your attention is required at all times to use this feature. Changing this setting takes effect when the car is powered off.`) }
                                isExpanded={ expandedCell == 'openpilot_enabled' }
                                handleExpanded={ () => this.handleExpanded('openpilot_enabled') }
                                handleChanged={ this.props.setOpenpilotEnabled } />
                        ) : null }
                        { !parseInt(isPassive) ? (
                            <X.TableCell
                                type='switch'
                                title='Enable Lane Change Assist'
                                value={ !!parseInt(laneChangeEnabled) }
                                iconSource={ Icons.openpilot }
                                description='Perform assisted lane changes with openpilot by checking your surroundings for safety, activating the turn signal and gently nudging the steering wheel towards your desired lane. openpilot is not capable of checking if a lane change is safe. You must continuously observe your surroundings to use this feature.'
                                isExpanded={ expandedCell == 'lanechange_enabled' }
                                handleExpanded={ () => this.handleExpanded('lanechange_enabled') }
                                handleChanged={ this.props.setLaneChangeEnabled } />
                        ) : null }
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Lane Departure Warnings`) }
                            value={ !!parseInt(isLaneDepartureWarningEnabled) }
                            iconSource={ Icons.warning }
                            description={ i18n._(t`Receive alerts to steer back into the lane when your vehicle drifts over a detected lane line without a turn signal activated while driving over 31mph (50kph).`) }
                            isExpanded={ expandedCell == 'ldw' }
                            handleExpanded={ () => this.handleExpanded('ldw') }
                            handleChanged={ this.props.setLaneDepartureWarningEnabled } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Record and Upload Driver Camera`) }
                            value={ !!parseInt(recordFront) }
                            iconSource={ Icons.network }
                            description={ i18n._(t`Upload data from the driver facing camera and help improve the Driver Monitoring algorithm.`) }
                            isExpanded={ expandedCell == 'record_front' }
                            handleExpanded={ () => this.handleExpanded('record_front') }
                            handleChanged={ this.props.setRecordFront } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Use Metric System`) }
                            value={ !!parseInt(isMetric) }
                            iconSource={ Icons.metric }
                            description={ i18n._(t`Display speed in km/h instead of mp/h.`) }
                            isExpanded={ expandedCell == 'metric' }
                            handleExpanded={ () => this.handleExpanded('metric') }
                            handleChanged={ this.props.setMetric } />
                      </X.Table>
                      {/*
                      <X.Table color='darkBlue'>
                        <X.TableCell
                            type='custom'
                            title={ i18n._(t`Add Speed Limit Offset`) }
                            iconSource={ Icons.speedLimit }
                            description={ i18n._(t`Customize the default speed limit warning with an offset in km/h or mph above the posted legal limit when available.`) }
                            isExpanded={ expandedCell == 'speedLimitOffset' }
                            handleExpanded={ () => this.handleExpanded('speedLimitOffset') }
                            handleChanged={ this.props.setLimitSetSpeed }>
                            <X.Button
                                color='ghost'
                                activeOpacity={ 1 }
                                style={ Styles.settingsSpeedLimitOffset }>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: speedLimitOffsetInt == (isMetric ? -15 : -10) ? 0.1 : 0.8 }] }
                                    onPress={ () => this.handleChangedSpeedLimitOffset('decrement')  }>
                                    <X.Image
                                        source={ Icons.minus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                                <X.Text
                                    color='white'
                                    weight='semibold'
                                    style={ Styles.settingsNumericValue }>
                                    { speedLimitOffsetInt }
                                </X.Text>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: speedLimitOffsetInt == (isMetric ? 25 : 15) ? 0.1 : 0.8 }] }
                                    onPress={ () => this.handleChangedSpeedLimitOffset('increment') }>
                                    <X.Image
                                        source={ Icons.plus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                            </X.Button>
                        </X.TableCell>
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Use Map To Control Vehicle Speed`) }
                            value={ !!parseInt(limitSetSpeed) }
                            isDisabled={ !parseInt(hasLongitudinalControl) }
                            iconSource={ Icons.mapSpeed }
                            description={ i18n._(t`Use map data to control the vehicle speed. A curvy road icon appears when the car automatically slows down for upcoming turns. The vehicle speed is also limited by the posted legal limit, when available, including the custom offset. This feature is only available for cars where openpilot manages longitudinal control and when EON has internet connectivity. The map icon appears when map data are downloaded.`) }
                            isExpanded={ expandedCell == 'limitSetSpeed' }
                            handleExpanded={ () => this.handleExpanded('limitSetSpeed') }
                            handleChanged={ this.props.setLimitSetSpeed } />
                    </X.Table>
                    */}
                    <X.Table color='darkBlue'>
                        <X.Button
                            color='settingsDefault'
                            onPress={ () => this.props.openTrainingGuide() }>
                            { i18n._(t`Review Training Guide`) }
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderAccountSettings() {
        const { isPaired } = this.props;
        const { expandedCell } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        { i18n._(t`<  Account Settings`) }
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <View>
                        <X.Table>
                            <X.TableCell
                                title={ i18n._(t`Device Paired`) }
                                value={ i18n._(isPaired ? t`Yes` : t`No`) } />
                            { isPaired ? (
                                <X.Text
                                    color='white'
                                    size='tiny'>
                                    <Trans>You may unpair your device in the comma connect app settings.</Trans>
                                </X.Text>
                            ) : null }
                            <X.Line color='light' />
                            <X.Text
                                color='white'
                                size='tiny'>
                                <Trans>Terms of Service available at {'https://my.comma.ai/terms.html'}</Trans>
                            </X.Text>
                        </X.Table>
                        { isPaired ? null : (
                            <X.Table color='darkBlue' padding='big'>
                                <X.Button
                                    color='settingsDefault'
                                    size='small'
                                    onPress={ this.props.openPairing }>
                                    {i18n._(t`Pair Device`)}
                                </X.Button>
                            </X.Table>
                        ) }
                    </View>
                </ScrollView>
            </View>
        )
    }

    renderDeviceSettings() {
        const {
            expandedCell,
        } = this.state;

        const {
            serialNumber,
            txSpeedKbps,
            freeSpace,
            isPaired,
            params: {
                DongleId: dongleId,
                Passive: isPassive,
            },
        } = this.props;
        const software = i18n._(!!parseInt(isPassive) ? t`chffrplus` : t`openpilot`);
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        { i18n._(t`<  Device Settings`) }
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='custom'
                            title={ i18n._(t`Camera Calibration`) }
                            iconSource={ Icons.calibration }
                            description={ i18n._(t`The calibration algorithm is always active on the road facing camera. Resetting calibration is only advised when the device reports an invalid calibration alert or when the device is remounted in a different position.`) }
                            isExpanded={ expandedCell == 'calibration' }
                            handleExpanded={ () => this.handleExpanded('calibration') }>
                            <X.Button
                                size='tiny'
                                color='settingsDefault'
                                onPress={ this.handlePressedResetCalibration  }
                                style={ { minWidth: '100%' } }>
                                { i18n._(t`Reset`) }
                            </X.Button>
                        </X.TableCell>
                    </X.Table>
                    <X.Table>
                        <X.TableCell
                            title={ i18n._(t`Paired`) }
                            value={ i18n._(isPaired ? t`Yes` : t`No`) } />
                        <X.TableCell
                            title={ i18n._(t`Dongle ID`) }
                            value={ dongleId } />
                        <X.TableCell
                            title={ i18n._(t`Serial Number`) }
                            value={ serialNumber } />
                        <X.TableCell
                            title={ i18n._(t`Free Storage`) }
                            value={ parseInt(freeSpace) + '%' }
                             />
                        <X.TableCell
                            title={ i18n._(t`Upload Speed`) }
                            value={ txSpeedKbps + ' kbps' }
                             />
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ () => this.props.reboot() }>
                            { i18n._(t`Reboot`) }
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini' />
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ () => this.props.shutdown() }>
                            { i18n._(t`Power Off`) }
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderNetworkSettings() {
        const { expandedCell } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        { i18n._(t`<  Network Settings`) }
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table spacing='big' color='darkBlue'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ this.props.openWifiSettings }>
                            { i18n._(t`Open WiFi Settings`) }
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini' />
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ () => ChffrPlus.openTetheringSettings() }>
                            { i18n._(t`Open Tethering Settings`) }
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderDeveloperSettings() {
        const {
            isSshEnabled,
            params: {
                Version: version,
                GitBranch: gitBranch,
                GitCommit: gitRevision,
                Passive: isPassive,
                PandaFirmwareHex: pandaFirmwareHex,
                PandaDongleId: pandaDongleId,
                CommunityFeaturesToggle: communityFeatures,
            },
        } = this.props;
        const { expandedCell } = this.state;
        const software = i18n._(!!parseInt(isPassive) ? t`chffrplus` : t`openpilot`);
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        { i18n._(t`<  Developer Settings`) }
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable Community Features`) }
                            value={ !!parseInt(communityFeatures) }
                            iconSource={ Icons.developer }
                            descriptionExtra={
                              <X.Text color='white' size='tiny'>
                                  { i18n._(t`
                                  Use features from the open source community that are not maintained or supported by comma.ai and have not been confirmed to meet the standard safety model. Be extra cautious when using these features:${'\n'}
                                  * GM car port${'\n'}
                                  * Toyota with DSU unplugged${'\n'}
                                  * Pedal interceptor${'\n'}
                                  `) }
                              </X.Text>
                            }
                            isExpanded={ expandedCell == 'communityFeatures' }
                            handleExpanded={ () => this.handleExpanded('communityFeatures') }
                            handleChanged={ this.props.setCommunityFeatures } />
                        <X.TableCell
                            type='switch'
                            title={ i18n._(t`Enable SSH`) }
                            value={ isSshEnabled }
                            iconSource={ Icons.developer }
                            description={ i18n._(t`Allow devices to connect to your device using Secure Shell (SSH).`) }
                            isExpanded={ expandedCell == 'ssh' }
                            handleExpanded={ () => this.handleExpanded('ssh') }
                            handleChanged={ this.props.setSshEnabled } />
                        <X.TableCell
                            iconSource={ Icons.developer }
                            title={ i18n._(t`Authorized SSH Keys`) }
                            descriptionExtra={ this.renderSshInput() }
                            isExpanded={ expandedCell === 'ssh_keys' }
                            handleExpanded={ this.toggleExpandGithubInput }
                            type='custom'>
                            <X.Button
                                size='tiny'
                                color='settingsDefault'
                                onPress={ this.toggleExpandGithubInput }
                                style={ { minWidth: '100%' } }>
                                { i18n._(expandedCell === 'ssh_keys' ? t`Cancel` : t`Edit`) }
                            </X.Button>
                        </X.TableCell>
                    </X.Table>
                    <X.Table spacing='none'>
                        <X.TableCell
                            title={ i18n._(t`Version`) }
                            value={ `${ software } v${ version }` } />
                        <X.TableCell
                            title={ i18n._(t`Git Branch`) }
                            value={ gitBranch } />
                        <X.TableCell
                            title={ i18n._(t`Git Revision`) }
                            value={ gitRevision.slice(0, 12) }
                            valueTextSize='tiny' />
                        <X.TableCell
                            title={ i18n._(t`Panda Firmware`) }
                            value={ pandaFirmwareHex != null ? pandaFirmwareHex : 'N/A' }
                            valueTextSize='tiny' />
                        <X.TableCell
                            title={ i18n._(t`Panda Dongle ID`) }
                            value={ i18n._((pandaDongleId != null && pandaDongleId != "unprovisioned") ? pandaDongleId : t`N/A`) }
                            valueTextSize='tiny' />
                    </X.Table>
                    <X.Table color='darkBlue' padding='big'>
                        <X.Button
                            color='settingsDefault'
                            size='small'
                            onPress={ this.props.uninstall }>
                            { i18n._(t`Uninstall ${ software }`) }
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderSshInput() {
        let { githubUsername, authKeysUpdateState } = this.state;
        let githubUsernameIsValid = githubUsername.match(/[a-zA-Z0-9-]+/) !== null;

        return (
            <View>
                <X.Text color='white' size='tiny'>
                    {i18n._(t`
                    WARNING:
                    ${'\n'}
                    This grants SSH access to all public keys in your GitHub settings.
                    ${'\n'}
                    Never enter a GitHub username other than your own.
                    ${'\n'}
                    The built-in SSH key will be disabled if you proceed.
                    ${'\n'}
                    A comma employee will never ask you to add their GitHub.
                    ${'\n'}
                    `)}
                </X.Text>
                <View style={ Styles.githubUsernameInputContainer }>
                    <X.Text
                        color='white'
                        weight='semibold'
                        size='small'
                        style={ Styles.githubUsernameInputLabel }>
                        <Trans>GitHub Username</Trans>
                    </X.Text>
                    <TextInput
                        style={ Styles.githubUsernameInput }
                        onChangeText={ (text) => this.setState({ githubUsername: text, authKeysUpdateState: null })}
                        value={ githubUsername }
                        ref={ ref => this.githubInput = ref }
                        underlineColorAndroid='transparent'
                    />
                </View>
                <View>
                    <X.Button
                        size='tiny'
                        color='settingsDefault'
                        isDisabled={ !githubUsernameIsValid }
                        onPress={ this.writeSshKeys }
                        style={ Styles.githubUsernameSaveButton }>
                        <X.Text color='white' size='small' style={ Styles.githubUsernameInputSave }><Trans>Save</Trans></X.Text>
                    </X.Button>
                    { authKeysUpdateState !== null &&
                        <View style={ Styles.githubUsernameInputStatus }>
                            { authKeysUpdateState === 'inflight' &&
                                <ActivityIndicator
                                    color='white'
                                    refreshing={ true }
                                    size={ 37 }
                                    style={ Styles.connectingIndicator } />
                            }
                            { authKeysUpdateState === 'failed' &&
                                <X.Text color='white' size='tiny'><Trans>Save failed. Ensure that your username is correct and you are connected to the internet.</Trans></X.Text>
                            }
                        </View>
                    }
                    <View style={ Styles.githubSshKeyClearContainer }>
                        <X.Button
                            size='tiny'
                            color='settingsDefault'
                            onPress={ this.clearSshKeys }
                            style={ Styles.githubUsernameSaveButton }>
                            <X.Text color='white' size='small' style={ Styles.githubUsernameInputSave }><Trans>Remove all</Trans></X.Text>
                        </X.Button>
                    </View>
                </View>
            </View>
        );
    }

    toggleExpandGithubInput() {
        this.setState({ authKeysUpdateState: null });
        this.handleExpanded('ssh_keys');
    }

    clearSshKeys() {
        ChffrPlus.resetSshKeys();
    }

    async writeSshKeys() {
        let { githubUsername } = this.state;

        try {
            this.setState({ authKeysUpdateState: 'inflight' })
            const resp = await fetch(`https://github.com/${githubUsername}.keys`);
            const githubKeys = (await resp.text());
            if (resp.status !== 200) {
                throw new Error('Non-200 response code from GitHub');
            }

            await ChffrPlus.writeParam(Params.KEY_GITHUB_SSH_KEYS, githubKeys);
            this.toggleExpandGithubInput();
        } catch(err) {
            console.log(err);
            this.setState({ authKeysUpdateState: 'failed' });
        }
    }

    renderSettingsByRoute() {
        const { route } = this.state;
        switch (route) {
            case SettingsRoutes.PRIMARY:
                return this.renderPrimarySettings();
            case SettingsRoutes.ACCOUNT:
                return this.renderAccountSettings();
            case SettingsRoutes.DEVICE:
                return this.renderDeviceSettings();
            case SettingsRoutes.NETWORK:
                return this.renderNetworkSettings();
            case SettingsRoutes.DEVELOPER:
                return this.renderDeveloperSettings();
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
    isSshEnabled: state.host.isSshEnabled,
    serialNumber: state.host.serial,
    simState: state.host.simState,
    wifiState: state.host.wifiState,
    isPaired: state.host.device && state.host.device.is_paired,

    // Uploader
    txSpeedKbps: parseInt(state.uploads.txSpeedKbps),
    freeSpace: state.host.thermal.freeSpace,

    params: state.params.params,
});

const mapDispatchToProps = dispatch => ({
    dispatch,
    navigateHome: async () => {
        dispatch(resetToLaunch());
    },
    openPairing: () => {
        dispatch(NavigationActions.navigate({ routeName: 'SetupQr' }));
    },
    openWifiSettings: () => {
        dispatch(NavigationActions.navigate({ routeName: 'SettingsWifi' }));
    },
    reboot: () => {
        Alert.alert(i18n._(t`Reboot`), i18n._(t`Are you sure you want to reboot?`), [
            { text: i18n._(t`Cancel`), onPress: () => {}, style: 'cancel' },
            { text: i18n._(t`Reboot`), onPress: () => ChffrPlus.reboot() },
        ]);
    },
    shutdown: () => {
        Alert.alert(i18n._(t`Power Off`), i18n._(t`Are you sure you want to shutdown?`), [
            { text: i18n._(t`Cancel`), onPress: () => {}, style: 'cancel' },
            { text: i18n._(t`Shutdown`), onPress: () => ChffrPlus.shutdown() },
        ]);
    },
    uninstall: () => {
        Alert.alert(i18n._(t`Uninstall`), i18n._(t`Are you sure you want to uninstall?`), [
            { text: i18n._(t`Cancel`), onPress: () => {}, style: 'cancel' },
            { text: i18n._(t`Uninstall`), onPress: () => ChffrPlus.writeParam(Params.KEY_DO_UNINSTALL, "1") },
        ]);
    },
    openTrainingGuide: () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({ routeName: 'Onboarding' })
            ]
        }))
    },
    openDragonpilotSettings: () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({ routeName: 'DragonpilotSettings' })
            ]
        }))
    },
    setOpenpilotEnabled: (openpilotEnabled) => {
        dispatch(updateParam(Params.KEY_OPENPILOT_ENABLED, (openpilotEnabled | 0).toString()));
    },
    setMetric: (useMetricUnits) => {
        dispatch(updateParam(Params.KEY_IS_METRIC, (useMetricUnits | 0).toString()));
    },
    setRecordFront: (recordFront) => {
        dispatch(updateParam(Params.KEY_RECORD_FRONT, (recordFront | 0).toString()));
    },
    setSshEnabled: (isSshEnabled) => {
        dispatch(updateSshEnabled(!!isSshEnabled));
    },
    setHasLongitudinalControl: (hasLongitudinalControl) => {
        dispatch(updateParam(Params.KEY_HAS_LONGITUDINAL_CONTROL, (hasLongitudinalControl | 0).toString()));
    },
    setLimitSetSpeed: (limitSetSpeed) => {
        dispatch(updateParam(Params.KEY_LIMIT_SET_SPEED, (limitSetSpeed | 0).toString()));
    },
    setSpeedLimitOffset: (speedLimitOffset) => {
        dispatch(updateParam(Params.KEY_SPEED_LIMIT_OFFSET, (speedLimitOffset).toString()));
    },
    setCommunityFeatures: (communityFeatures) => {
        if (communityFeatures == 1) {
            Alert.alert(i18n._(t`Enable Community Features`), i18n._(t`Community maintained features are not confirmed by comma.ai to meet the standard safety model. Be extra cautious using them.`), [
                { text: i18n._(t`Cancel`), onPress: () => {}, style: 'cancel' },
                { text: i18n._(t`Enable`), onPress: () => {
                    dispatch(updateParam(Params.KEY_COMMUNITY_FEATURES, (communityFeatures | 0).toString()));
                } },
            ]);
        } else {
            dispatch(updateParam(Params.KEY_COMMUNITY_FEATURES, (communityFeatures | 0).toString()));
        }
    },
    setLaneDepartureWarningEnabled: (isLaneDepartureWarningEnabled) => {
        dispatch(updateParam(Params.KEY_LANE_DEPARTURE_WARNING_ENABLED, (isLaneDepartureWarningEnabled | 0).toString()));
    },
    setLaneChangeEnabled: (laneChangeEnabled) => {
        dispatch(updateParam(Params.KEY_LANE_CHANGE_ENABLED, (laneChangeEnabled | 0).toString()));
    },
    runTomTom: (val) => {
        dispatch(updateParam(Params.KEY_RUN_TOMTOM, (val).toString()));
    },
    runAutonavi: (val) => {
        dispatch(updateParam(Params.KEY_RUN_AUTONAVI, (val).toString()));
    },
    runAegis: (val) => {
        dispatch(updateParam(Params.KEY_RUN_AEGIS, (val).toString()));
    },
    deleteParam: (param) => {
        dispatch(deleteParam(param));
    },
    refreshParams: () => {
        dispatch(refreshParams());
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
