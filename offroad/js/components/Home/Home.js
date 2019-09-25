import React, { Component } from 'react';
import {
    Linking,
    Text,
    View,
} from 'react-native';
import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';

// Native Modules
import ChffrPlus from '../../native/ChffrPlus';

// UI
import { HOME_BUTTON_GRADIENT } from '../../styles/gradients';
import X from '../../themes';
import Styles from './HomeStyles';

class Home extends Component {
    static navigationOptions = {
      header: null,
    };

    handlePressedStartDrive = () => {
        this.props.onNewDrivePressed();
    }

    handlePressedSettings = () => {
        ChffrPlus.sendBroadcast("ai.comma.plus.offroad.NAVIGATED_TO_SETTINGS");
        this.props.openSettings();
    }

    handlePressedDragonpilotSettings = () => {
        ChffrPlus.sendBroadcast("ai.comma.plus.offroad.NAVIGATED_TO_DRAGONPILOT_SETTINGS");
        this.props.openDragonpilotSettings();
    }

    renderDrivePrompt() {
        return (
            <X.Button
                color='transparent'
                size='full'
                onPress={ this.handlePressedStartDrive }>
                <X.Gradient
                    colors={ HOME_BUTTON_GRADIENT }
                    style={ Styles.homeActionsPrimaryButton }>
                    <View style={ Styles.homeActionsPrimaryButtonBody }>
                        <View style={ Styles.homeActionsPrimaryButtonIcon }>
                            <X.Image
                                source={ require('../../img/icon_plus.png') } />
                        </View>
                        <X.Text
                            color='white'
                            weight='semibold'
                            size='medium'>
                            新的駕駛
                        </X.Text>
                    </View>
                </X.Gradient>
            </X.Button>
        );
    }

    getLocalizedDate(){
        var n = new Date()
        var weekdays = new Array("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六")
        return n.getFullYear() + ' 年 ' + (n.getMonth()+1) +' 月 ' + n.getDate() + ' 日 ' + ' ' + weekdays[n.getDay()]
    }

    render() {
        const {
            isPaired,
            isNavAvailable,
            summaryDate,
            summaryCity,
        } = this.props;

        return (
            <X.Gradient color='dark_blue'>
                <View style={ Styles.home }>
                    <View style={ Styles.homeWelcome }>
                        <View style={ Styles.homeWelcomeSummary }>
                            <View style={ Styles.homeWelcomeSummaryDate }>
                                <X.Text
                                    color='white'
                                    weight='light'>
                                    { this.getLocalizedDate() }
                                </X.Text>
                            </View>
                            <View style={ Styles.homeWelcomeSummaryCity }>
                                <X.Text
                                    color='white'
                                    size={ summaryCity.length > 20 ? 'big' : 'jumbo' }
                                    numberOfLines={ 1 }
                                    weight='semibold'>
                                    { summaryCity }
                                </X.Text>
                            </View>
                        </View>
                    </View>
                    <View style={ Styles.homeActions }>
                        <View style={ Styles.homeActionsPrimary }>
                            { this.renderDrivePrompt() }
                        </View>
                        <View style={ Styles.homeActionsSecondary }>
                            <View style={ Styles.homeActionsSecondaryAction }>
                                <X.Button
                                    color='transparent'
                                    size='full'
                                    onPress={ isPaired ? null : this.props.openPairing }>
                                    <X.Gradient
                                        colors={ HOME_BUTTON_GRADIENT }
                                        style={ Styles.homeActionsSecondaryButton }>
                                        { isPaired ?
                                            <View style={ Styles.homeActionsSecondaryButtonBody }>
                                                <View style={ Styles.homeActionsSecondaryButtonIcon }>
                                                    <X.Image
                                                        source={ require('../../img/icon_road.png') } />
                                                </View>
                                                <X.Text
                                                    color='white'
                                                    weight='semibold'>
                                                    EON 已配對
                                                </X.Text>
                                            </View>
                                            :
                                            <View style={ Styles.homeActionsSecondaryButtonBody }>
                                                <View style={ Styles.homeActionsSecondaryButtonIcon }>
                                                    <X.Image
                                                        source={ require('../../img/icon_user.png') } />
                                                </View>
                                                <X.Text
                                                    color='white'
                                                    weight='semibold'>
                                                    配對 EON
                                                </X.Text>
                                            </View>
                                        }
                                    </X.Gradient>
                                </X.Button>
                            </View>
                            <View style={ Styles.homeActionsSecondaryAction }>
                                <X.Button
                                    color='transparent'
                                    size='full'
                                    onPress={ this.handlePressedSettings }>
                                    <X.Gradient
                                        colors={ HOME_BUTTON_GRADIENT }
                                        style={ Styles.homeActionsSecondaryButton }>
                                        <View style={ Styles.homeActionsSecondaryButtonBody }>
                                            <View style={ Styles.homeActionsSecondaryButtonIcon }>
                                                <X.Image
                                                    source={ require('../../img/icon_settings.png') } />
                                            </View>
                                            <X.Text
                                                color='white'
                                                weight='semibold'>
                                                設定
                                            </X.Text>
                                        </View>
                                    </X.Gradient>
                                </X.Button>
                            </View>
                            <View style={ Styles.homeActionsSecondaryAction }>
                                <X.Button
                                    color='transparent'
                                    size='full'
                                    onPress={ this.handlePressedDragonpilotSettings }>
                                    <X.Gradient
                                        colors={ HOME_BUTTON_GRADIENT }
                                        style={ Styles.homeActionsSecondaryButton }>
                                        <View style={ Styles.homeActionsSecondaryButtonBody }>
                                            <View style={ Styles.homeActionsSecondaryButtonIcon }>
                                                <X.Image
                                                    source={ require('../../img/icon_settings.png') } />
                                            </View>
                                            <X.Text
                                                color='white'
                                                weight='semibold'>
                                                dragonpilot
                                            </X.Text>
                                        </View>
                                    </X.Gradient>
                                </X.Button>
                            </View>
                        </View>
                    </View>
                </View>
            </X.Gradient>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isPaired: state.host.device && state.host.device.is_paired,
        isNavAvailable: state.host.isNavAvailable,
        latitude: state.environment.latitude,
        longitude: state.environment.longitude,
        summaryCity: state.environment.city,
        summaryDate: state.environment.date,
    };
};

const mapDispatchToProps = (dispatch) => ({
    openSettings: () => {
        dispatch(NavigationActions.navigate({ routeName: 'Settings' }));
    },
    openDragonpilotSettings: () => {
        dispatch(NavigationActions.navigate({ routeName: 'DragonpilotSettings' }));
    },
    openPairing: () => {
        dispatch(NavigationActions.navigate({ routeName: 'SetupQr' }))
    },
    openDrives: () => {
        dispatch(NavigationActions.navigate({ routeName: 'DrivesOverview' }));
    },
    onNewDrivePressed: () => {
        ChffrPlus.sendBroadcast("ai.comma.plus.frame.ACTION_SHOW_START_CAR");
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
