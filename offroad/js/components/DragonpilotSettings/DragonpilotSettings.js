import React, { Component } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import ChffrPlus from '../../native/ChffrPlus';
import { Params } from '../../config';

import {
    deleteParam,
    updateParam,
} from '../../store/params/actions';

import X from '../../themes';
import Styles from './DragonpilotSettingsStyles';

const SettingsRoutes = {
    PRIMARY: 'PRIMARY',
    SAFETY: 'SAFETY',
    UI: 'UI',
    APP: 'APP',
    TOYOTA: 'TOYOTA',
    // HONDA: 'HONDA',
}

const Icons = {
    developer: require('../../img/icon_shell.png'),
    plus: require('../../img/icon_plus.png'),
    minus: require('../../img/icon_minus.png'),
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
            enableTomTom: false,
            enableAutonavi: false,
            enableMixplorer: false,
            cameraOffsetInt: '6',
            autoShutdownAtInt: '0',
            VolumeBoost: '0',
        }
    }

    async componentWillMount() {
        const {
            params: {
                DragonSteeringMonitorTimer: dragonSteeringMonitorTimer,
                DragonEnableTomTom: dragonEnableTomTom,
                DragonEnableAutonavi: dragonEnableAutonavi,
                DragonEnableMixplorer: dragonEnableMixplorer,
                DragonCammeraOffset: dragonCameraOffset,
                DragonAutoShutdownAt: dragonAutoShutdownAt,
                DragonUIVolumeBoost: dragonUIVolumeBoost,
            },
        } = this.props;
        this.setState({ steeringMonitorTimerInt: dragonSteeringMonitorTimer === '0'? 0 : parseInt(dragonSteeringMonitorTimer) || 3 })
        this.setState({ enableTomTom: dragonEnableTomTom === '1' })
        this.setState({ enableAutonavi: dragonEnableAutonavi === '1' })
        this.setState({ enableMixplorer: dragonEnableMixplorer === '1' })
        this.setState({ cameraOffsetInt: dragonCameraOffset === '0'? 0 : parseInt(dragonCameraOffset) || 6 })
        this.setState({ autoShutdownAtInt: dragonAutoShutdownAt === '0'? 0 : parseInt(dragonAutoShutdownAt) || 0 })
        this.setState({ VolumeBoostInt: dragonUIVolumeBoost === '0'? 0 : parseInt(dragonUIVolumeBoost) || 0 })
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
    }

    handleChangedSteeringMonitorTimer(operator) {
        const { steeringMonitorTimerInt } = this.state;
        let _steeringMonitorTimer;
        switch (operator) {
          case 'increment':
              _steeringMonitorTimer = steeringMonitorTimerInt + 1;
              break;
          case 'decrement':
              _steeringMonitorTimer = Math.max(0, steeringMonitorTimerInt - 1);
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
                _autoShutdownAt = autoShutdownAtInt - 1;
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

    handleRunApp(app, val) {
        switch (app) {
            case 'mixplorer':
                this.props.runMixplorer(val);
                break;
        }
    }

    renderSettingsMenu() {
        const settingsMenuItems = [
            {
                icon: Icons.developer,
                title: 'Safety',
                context: 'Settings',
                route: SettingsRoutes.SAFETY,
            },
            {
                icon: Icons.developer,
                title: 'UI',
                context: 'Settings',
                route: SettingsRoutes.UI,
            },
            {
                icon: Icons.developer,
                title: '3rd Party Apps',
                context: 'Settings',
                route: SettingsRoutes.APP,
            },
            {
                icon: Icons.developer,
                title: 'Toyota/Lexus',
                context: 'Settings',
                route: SettingsRoutes.TOYOTA,
            },
            // {
            //     icon: Icons.developer,
            //     title: 'Honda',
            //     context: '',
            //     route: SettingsRoutes.HONDA,
            // },
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
                DragonEnableLogger: dragonEnableLogger,
                DragonEnableUploader: dragonEnableUploader,
                DragonEnableDashcam: dragonEnableDashcam,
                DragonNoctuaMode: dragonNoctuaMode,
                DragonCacheCar: dragonCacheCar,
            }
        } = this.props;
        const { expandedCell, enableMixplorer, cameraOffsetInt, autoShutdownAtInt } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  Dragonpilot Settings'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Table direction='row' color='darkBlue'>
                        { this.renderSettingsMenu() }
                    </X.Table>
                    <X.Table spacing='none'>
                        <X.TableCell
                            title='English Localisation'
                            value='comma.ai (https://github.com/commaai/)'
                            valueTextSize='tiny' />
                    </X.Table>
                    {enableMixplorer &&
                    <X.Table color='darkBlue'>
                        <X.Button
                            color='settingsDefault'
                            onPress={() => this.handleRunApp('mixplorer', '1')}>
                            MiXplorer File Manager
                        </X.Button>
                    </X.Table>
                    }
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='Enable Logger'
                            value={ !!parseInt(dragonEnableLogger) }
                            iconSource={ Icons.developer }
                            description='If you disable logger (loggered/tombstoned), it will stop recording driving data for AI training, reboot required.'
                            isExpanded={ expandedCell == 'enable_logger' }
                            handleExpanded={ () => this.handleExpanded('enable_logger') }
                            handleChanged={ this.props.setEnableLogger } />
                        <X.TableCell
                            type='switch'
                            title='Enable Uploader'
                            value={ !!parseInt(dragonEnableUploader) }
                            iconSource={ Icons.developer }
                            description='If you disable uploader, it will stop uploading driving data for AI training, reboot required.'
                            isExpanded={ expandedCell == 'enable_uploader' }
                            handleExpanded={ () => this.handleExpanded('enable_uploader') }
                            handleChanged={ this.props.setEnableUploader } />
                        <X.TableCell
                            type='switch'
                            title='Enable Dashcam'
                            value={ !!parseInt(dragonEnableDashcam) }
                            iconSource={ Icons.developer }
                            description='Record EON screen as dashcam footage, it will automatically delete old footage if the available space is less than 15%, footage will be stored in /sdcard/dashcam/.'
                            isExpanded={ expandedCell == 'dashcam' }
                            handleExpanded={ () => this.handleExpanded('dashcam') }
                            handleChanged={ this.props.setEnableDashcam } />
                        <X.TableCell
                            type='custom'
                            title='Auto Shutdown (min)'
                            iconSource={ Icons.developer }
                            description='Adjust the shutdown timer if you would like EON to shutdown after a period of time (when usb power is not present), set this to 0 if you would like to disable this feature.'
                            isExpanded={ expandedCell == 'autoShutdown' }
                            handleExpanded={ () => this.handleExpanded('autoShutdown') }>
                            <X.Button
                                color='ghost'
                                activeOpacity={ 1 }
                                style={ Styles.settingsPlusMinus }>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: autoShutdownAtInt <= 0? 0.1 : 0.8 }] }
                                    onPress={ () => this.handleChangedAutoShutdownAt('decrement')  }>
                                    <X.Image
                                        source={ Icons.minus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                                <X.Text
                                    color='white'
                                    weight='semibold'
                                    style={ Styles.settingsNumericValue }>
                                    { autoShutdownAtInt }
                                </X.Text>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: 0.8 }] }
                                    onPress={ () => this.handleChangedAutoShutdownAt('increment') }>
                                    <X.Image
                                        source={ Icons.plus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                            </X.Button>
                        </X.TableCell>
                        <X.TableCell
                            type='switch'
                            title='Enable Noctua Fan Mode'
                            value={ !!parseInt(dragonNoctuaMode) }
                            iconSource={ Icons.developer }
                            description='Enable this will let the fan running at full speed at any temperature, reboot required.'
                            isExpanded={ expandedCell == 'enable_noctua_mode' }
                            handleExpanded={ () => this.handleExpanded('enable_noctua_mode') }
                            handleChanged={ this.props.setNoctuaMode } />
                        <X.TableCell
                            type='switch'
                            title='Cache Fingerprint'
                            value={ !!parseInt(dragonCacheCar) }
                            iconSource={ Icons.developer }
                            description='Enable this to store your fingerprint/vin/car model into files and use it when required, this will reduce the car model detection time, disable this if you put EON onto another car, reboot required.'
                            isExpanded={ expandedCell == 'cache_fingerprint' }
                            handleExpanded={ () => this.handleExpanded('cache_fingerprint') }
                            handleChanged={ this.props.setCacheCar } />
                        <X.TableCell
                            type='custom'
                            title='Camera Offset (cm)'
                            iconSource={ Icons.developer }
                            description='Adjust the camera offset if your car is not centered, slowly increase this if your car is close to the right, slowly decrease this if your car is close to the left, default is 6 cm.'
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
                    </X.Table>
                    <X.Table color='darkBlue' padding='big'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ () => ChffrPlus.openLocaleSettings() }>
                            Open Locale Settings
                        </X.Button>
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
                        {'<  Safety Settings'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='Enable Lateral Control'
                            value={ !!parseInt(dragonLatCtrl) }
                            iconSource={ Icons.developer }
                            description='Enable this if you wish dp to control the steering for you.'
                            isExpanded={ expandedCell == 'lat_ctrl' }
                            handleExpanded={ () => this.handleExpanded('lat_ctrl') }
                            handleChanged={ this.props.setLatCtrl } />
                        <X.TableCell
                            type='switch'
                            title='Allow Gas'
                            value={ !!parseInt(dragonAllowGas) }
                            iconSource={ Icons.developer }
                            description='Enable this if you wish to use gas on engaged.'
                            isExpanded={ expandedCell == 'allow_gas' }
                            handleExpanded={ () => this.handleExpanded('allow_gas') }
                            handleChanged={ this.props.setAllowGas } />
                        <X.TableCell
                            type='switch'
                            title='Enable Steering On Signal'
                            value={ !!parseInt(dragonEnableSteeringOnSignal) }
                            iconSource={ Icons.developer }
                            description='If you enable this, it will temporary disable steering control when left/right blinker is on and resume control 1 second after the blinker is off.'
                            isExpanded={ expandedCell == 'enable_steering_on_signal' }
                            handleExpanded={ () => this.handleExpanded('enable_steering_on_signal') }
                            handleChanged={ this.props.setEnableSteeringOnSignal } />
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='Enable Safety Check'
                            value={ !!parseInt(dragonEnableDriverSafetyCheck) }
                            iconSource={ Icons.developer }
                            description='If you disable this, the driver safety check will be disabled completely, we DO NOT RECOMMEND that you turn off this unless you know what you are doing, we hold no responsibility if you disable this option.'
                            isExpanded={ expandedCell == 'safetyCheck' }
                            handleExpanded={ () => this.handleExpanded('safetyCheck') }
                            handleChanged={ this.props.setEnableDriverSafetyCheck } />
                        <X.TableCell
                            type='custom'
                            title='Steering Monitor Timer'
                            iconSource={ Icons.developer }
                            description='Adjust the steering monitor timer, set this to 0 if you would like to disable steering monitor. Default is 3 minutes.'
                            isExpanded={ expandedCell == 'steering_monitor_timer' }
                            handleExpanded={ () => this.handleExpanded('steering_monitor_timer') }>
                            <X.Button
                                color='ghost'
                                activeOpacity={ 1 }
                                style={ Styles.settingsPlusMinus }>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: steeringMonitorTimerInt <= 0? 0.1 : 0.8 }] }
                                    onPress={ () => this.handleChangedSteeringMonitorTimer('decrement')  }>
                                    <X.Image
                                        source={ Icons.minus }
                                        style={ Styles.settingsNumericIcon } />
                                </X.Button>
                                <X.Text
                                    color='white'
                                    weight='semibold'
                                    style={ Styles.settingsNumericValue }>
                                    { steeringMonitorTimerInt }
                                </X.Text>
                                <X.Button
                                    style={ [Styles.settingsNumericButton, { opacity: 0.8 }] }
                                    onPress={ () => this.handleChangedSteeringMonitorTimer('increment') }>
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

    renderAPPSettings() {
        const {
            params: {
                DragonEnableTomTom: dragonEnableTomTom,
                DragonBootTomTom: dragonBootTomTom,
                DragonEnableAutonavi: dragonEnableAutonavi,
                DragonBootAutonavi: dragonBootAutonavi,
                DragonEnableMixplorer: dragonEnableMixplorer,
            },
        } = this.props;
        const { expandedCell, enableTomTom, enableAutonavi } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  3rd Party Apps Settings'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='Enable TomTom Safety Camera App'
                            value={ !!parseInt(dragonEnableTomTom) }
                            iconSource={ Icons.developer }
                            description='Enable this if you wish to use TomTom Safety Camera App, restart required.'
                            isExpanded={ expandedCell == 'enable_tomtom' }
                            handleExpanded={ () => this.handleExpanded('enable_tomtom') }
                            handleChanged={ this.props.setEnableTomTom } />
                        {enableTomTom &&
                        <X.TableCell
                            type='switch'
                            title='Auto Run TomTom Safety Camera App'
                            value={!!parseInt(dragonBootTomTom)}
                            iconSource={Icons.developer}
                            description='Enable this will have TomTom Safety Camera App start when car is on, stop when car is off.'
                            isExpanded={expandedCell == 'run_tomtom'}
                            handleExpanded={() => this.handleExpanded('run_tomtom')}
                            handleChanged={this.props.setBootTomTom}/>
                        }
                        <X.TableCell
                            type='switch'
                            title='Enable Autonavi Map App'
                            value={ !!parseInt(dragonEnableAutonavi) }
                            iconSource={ Icons.developer }
                            description='Enable this if you wish to use Autonavi Map App, restart required.'
                            isExpanded={ expandedCell == 'enable_autonavi' }
                            handleExpanded={ () => this.handleExpanded('enable_autonavi') }
                            handleChanged={ this.props.setEnableAutonavi} />
                        {enableAutonavi &&
                        <X.TableCell
                            type='switch'
                            title='Auto Run Autonavi Map'
                            value={!!parseInt(dragonBootAutonavi)}
                            iconSource={Icons.developer}
                            description='Enable this will have Autonavi Map App start when car is on, stop when car is off.'
                            isExpanded={expandedCell == 'run_autonavi'}
                            handleExpanded={() => this.handleExpanded('run_autonavi')}
                            handleChanged={this.props.setBootAutonavi}/>
                        }
                        <X.TableCell
                            type='switch'
                            title='Enable MiXplorer App'
                            value={ !!parseInt(dragonEnableMixplorer) }
                            iconSource={ Icons.developer }
                            description='Enable this if you wish to use MiXplorer file manager App, restart required.'
                            isExpanded={ expandedCell == 'enable_mixplorer' }
                            handleExpanded={ () => this.handleExpanded('enable_mixplorer') }
                            handleChanged={ this.props.setEnableMixplorer} />
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderToyotaSettings() {
        const {
            params: {
                DragonToyotaStockDSU: dragonToyotaStockDSU,
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
                        {'<  Toyota/Lexus Settings'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='Enable Stock DSU Mode'
                            value={ !!parseInt(dragonToyotaStockDSU) }
                            iconSource={ Icons.developer }
                            description='Some models DSU cannot be unplugged (such as Lexus IS/GS/ES), once this option is enabled, turn on AHB (Auto High Beam) will keep you dp always on for Lat Control (control gas/brake manually), turn off AHB if you want to cancel dp Lat Control.'
                            isExpanded={ expandedCell == 'toyota_stock_dsu' }
                            handleExpanded={ () => this.handleExpanded('toyota_stock_dsu') }
                            handleChanged={ this.props.setToyotaStockDSU } />
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
    //                     {'<  Honda Settings'}
    //                 </X.Button>
    //             </View>
    //             <ScrollView
    //                 ref="settingsScrollView"
    //                 style={ Styles.settingsWindow }>
    //                 <View>
    //                     <X.Table>
    //                         <X.TableCell
    //                             title='Device Paired'
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
                DragonUIEvent: dragonUIEvent,
                DragonUIMaxSpeed: dragonUIMaxSpeed,
                DragonUIFace: dragonUIFace,
                DragonUIDev: dragonUIDev,
                DragonUIDevMini: dragonUIDevMini,
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
                        {'<  UI Settings'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='Display Event / Steering Icon'
                            value={ !!parseInt(dragonUIEvent) }
                            iconSource={ Icons.developer }
                            description='Enable this to display Event / Steering Icon.'
                            isExpanded={ expandedCell == 'dragon_ui_event' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_event') }
                            handleChanged={ this.props.setUIEvent } />
                        <X.TableCell
                            type='switch'
                            title='Display Max Speed'
                            value={ !!parseInt(dragonUIMaxSpeed) }
                            iconSource={ Icons.developer }
                            description='Enable this to display Max Speed.'
                            isExpanded={ expandedCell == 'dragon_ui_maxspeed' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_maxspeed') }
                            handleChanged={ this.props.setUIMaxSpeed } />
                        <X.TableCell
                            type='switch'
                            title='Display Face Icon'
                            value={ !!parseInt(dragonUIFace) }
                            iconSource={ Icons.developer }
                            description='Enable this to display Face Icon.'
                            isExpanded={ expandedCell == 'dragon_ui_face' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_face') }
                            handleChanged={ this.props.setUIFace } />
                        <X.TableCell
                            type='switch'
                            title='Display Dev UI'
                            value={ !!parseInt(dragonUIDev) }
                            iconSource={ Icons.developer }
                            description='Enable this to display DevUI found in kegman/arne fork.'
                            isExpanded={ expandedCell == 'dragon_ui_dev' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_dev') }
                            handleChanged={ this.props.setUIDev } />
                        <X.TableCell
                            type='switch'
                            title='Display Mini Dev UI'
                            value={ !!parseInt(dragonUIDevMini) }
                            iconSource={ Icons.developer }
                            description='Enable this to display Mini Dev UI designed for dragonpilot.'
                            isExpanded={ expandedCell == 'dragon_ui_dev_mini' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_dev_mini') }
                            handleChanged={ this.props.setUIDevMini } />
                        <X.TableCell
                            type='custom'
                            title='Boost Audio Alert Volume (%)'
                            iconSource={ Icons.developer }
                            description='Boost audio alert volume in percentage, set to -100 (%) if you would like to disable audio alert. Default is 0 (%).'
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
            case SettingsRoutes.TOYOTA:
                return this.renderToyotaSettings();
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
    setEnableMixplorer: (val) => {
        dispatch(updateParam(Params.KEY_ENABLE_MIXPLORER, (val | 0).toString()));
    },
    setSteeringMonitorTimer: (val) => {
        dispatch(updateParam(Params.KEY_STEERING_MONITOR_TIMER, (val | 3).toString()));
    },
    runMixplorer: (val) => {
        dispatch(updateParam(Params.KEY_RUN_MIXPLORER, (val | 0).toString()));
    },
    setCameraOffset: (val) => {
        dispatch(updateParam(Params.KEY_CAMERA_OFFSET, (val | 6).toString()));
    },
    setVolumeBoost: (val) => {
        dispatch(updateParam(Params.KEY_UI_VOLUME_BOOST, (val | 0).toString()));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(DragonpilotSettings);
