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
                DragonTempDisableSteerOnSignal: dragonTempDisableSteerOnSignal,
                DragonEnableDashcam: dragonEnableDashcam,
                DragonDisableDriverSafetyCheck: dragonDisableDriverSafetyCheck,
                DragonAutoShutdownAt: dragonAutoShutdownAt,
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
                        {'<  Settings'}
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
                            title='Disable Steering On Blinker'
                            value={ !!parseInt(dragonTempDisableSteerOnSignal) }
                            iconSource={ Icons.developer }
                            description='Temporary disable steering control when left/right blinker is on, will resume 1 second after the blinker is off.'
                            isExpanded={ expandedCell == 'disable_on_signal' }
                            handleExpanded={ () => this.handleExpanded('disable_on_signal') }
                            handleChanged={ this.props.setDisableOnSignal } />
                        <X.TableCell
                            type='switch'
                            title='Enable Dashcam'
                            value={ !!parseInt(dragonEnableDashcam) }
                            iconSource={ Icons.developer }
                            description='Record EON screen as dashcam footage, it will automatically delete old footage if the available space is less than 15%'
                            isExpanded={ expandedCell == 'dashcam' }
                            handleExpanded={ () => this.handleExpanded('dashcam') }
                            handleChanged={ this.props.setEnableDashcam } />
                        <X.TableCell
                            type='switch'
                            title='Enable Sleep Mode'
                            value={ !!parseInt(dragonDisableDriverSafetyCheck) }
                            iconSource={ Icons.developer }
                            description='This will disable driver safety check completely, we don not recommend that you turn on this unless you know what you are doing, we hold no responsibility if you enable this option.'
                            isExpanded={ expandedCell == 'safetyCheck' }
                            handleExpanded={ () => this.handleExpanded('safetyCheck') }
                            handleChanged={ this.props.setDriverSafetyCheck } />
                        <X.TableCell
                            type='switch'
                            title='Enable Auto Shutdown'
                            value={ parseInt(dragonAutoShutdownAt) > 0 }
                            iconSource={ Icons.developer }
                            description='Shutdown EON when usb power is not present for 30 minutes.'
                            isExpanded={ expandedCell == 'autoShutdown' }
                            handleExpanded={ () => this.handleExpanded('autoShutdown') }
                            handleChanged={ this.props.setAutoShutdown } />
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
    setDisableOnSignal: (disableOnSignal) => {
        dispatch(updateParam(Params.KEY_DISABLE_ON_SIGNAL, (disableOnSignal | 0).toString()));
    },
    setEnableDashcam: (enableDashcam) => {
        dispatch(updateParam(Params.KEY_ENABLE_DASHCAM, (enableDashcam | 0).toString()));
    },
    setDriverSafetyCheck: (safetyCheck) => {
        dispatch(updateParam(Params.KEY_DISABLE_DRIVER_SAFETY_CHECK, (safetyCheck | 0).toString()));
    },
    setAutoShutdown: (autoShutdown) => {
        dispatch(updateParam(Params.KEY_AUTO_SHUTDOWN, (autoShutdown? 30 : 0).toString()));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(DragonpilotSettings);
