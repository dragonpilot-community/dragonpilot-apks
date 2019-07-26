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
    TOYOTA: 'TOYOTA',
    HONDA: 'HONDA',
}

const Icons = {
    developer: require('../../img/icon_shell.png'),
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
        }
    }

    async componentWillMount() {
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

    renderSettingsMenu() {
        const settingsMenuItems = [
            {
                icon: Icons.developer,
                title: 'Toyota/Lexus',
                context: '',
                route: SettingsRoutes.TOYOTA,
            },
            {
                icon: Icons.developer,
                title: 'Honda',
                context: '',
                route: SettingsRoutes.HONDA,
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
                DragonAllowGas: dragonAllowGas,
                DragonEnableLogger: dragonEnableLogger,
                DragonEnableUploader: dragonEnableUploader,
                DragonEnableSteeringOnSignal: dragonEnableSteeringOnSignal,
                DragonEnableDashcam: dragonEnableDashcam,
                DragonEnableDriverSafetyCheck: dragonEnableDriverSafetyCheck,
                DragonAutoShutdownAt: dragonAutoShutdownAt,
                DragonNoctuaMode: dragonNoctuaMode,
                DragonCacheCar: dragonCacheCar,
                DragonBBUI: dragonBBUI,
            }
        } = this.props;
        const { expandedCell } = this.state;
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
                    <X.Table color='darkBlue'>
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
                            title='Enable Steering On Signal'
                            value={ !!parseInt(dragonEnableSteeringOnSignal) }
                            iconSource={ Icons.developer }
                            description='If you enable this, it will temporary disable steering control when left/right blinker is on and resume control 1 second after the blinker is off.'
                            isExpanded={ expandedCell == 'enable_steering_on_signal' }
                            handleExpanded={ () => this.handleExpanded('enable_steering_on_signal') }
                            handleChanged={ this.props.setEnableSteeringOnSignal } />
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
                            type='switch'
                            title='Enable Safety Check'
                            value={ !!parseInt(dragonEnableDriverSafetyCheck) }
                            iconSource={ Icons.developer }
                            description='If you disable this, the driver safety check will be disabled completely, we don not recommend that you turn on this unless you know what you are doing, we hold no responsibility if you disable this option.'
                            isExpanded={ expandedCell == 'safetyCheck' }
                            handleExpanded={ () => this.handleExpanded('safetyCheck') }
                            handleChanged={ this.props.setEnableDriverSafetyCheck } />
                        <X.TableCell
                            type='switch'
                            title='Enable Auto Shutdown'
                            value={ parseInt(dragonAutoShutdownAt) > 0 }
                            iconSource={ Icons.developer }
                            description='Shutdown EON when usb power is not present for 30 minutes.'
                            isExpanded={ expandedCell == 'autoShutdown' }
                            handleExpanded={ () => this.handleExpanded('autoShutdown') }
                            handleChanged={ this.props.setAutoShutdown } />
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
                            type='switch'
                            title='Enable DevUI'
                            value={ !!parseInt(dragonBBUI) }
                            iconSource={ Icons.developer }
                            description='Enable this to display DevUI found in kegman/arne fork.'
                            isExpanded={ expandedCell == 'dragon_bbui' }
                            handleExpanded={ () => this.handleExpanded('dragon_bbui') }
                            handleChanged={ this.props.setBBUI } />
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

    renderToyotaSettings() {
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
                    <View>
                        <X.Table>
                            <X.TableCell
                                title='Device Paired'
                                value='Yes' />
                        </X.Table>
                    </View>
                </ScrollView>
            </View>
        )
    }

    renderHondaSettings() {
        const { expandedCell } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  Honda Settings'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <View>
                        <X.Table>
                            <X.TableCell
                                title='Device Paired'
                                value='Yes' />
                        </X.Table>
                    </View>
                </ScrollView>
            </View>
        )
    }

    renderSettingsByRoute() {
        const { route } = this.state;
        switch (route) {
            case SettingsRoutes.PRIMARY:
                return this.renderPrimarySettings();
            case SettingsRoutes.TOYOTA:
                return this.renderToyotaSettings();
            case SettingsRoutes.HONDA:
                return this.renderHondaSettings();
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
        dispatch(updateParam(Params.KEY_AUTO_SHUTDOWN, (autoShutdown? 30 : 0).toString()));
    },
    setNoctuaMode: (noctuaMode) => {
        dispatch(updateParam(Params.KEY_ENABLE_NOCTUA_MODE, (noctuaMode | 0).toString()));
    },
    setCacheCar: (cacheCar) => {
        dispatch(updateParam(Params.KEY_CACHE_CAR, (cacheCar | 0).toString()));
    },
    setBBUI: (bbui) => {
        dispatch(updateParam(Params.KEY_BBUI, (bbui | 0).toString()));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(DragonpilotSettings);
