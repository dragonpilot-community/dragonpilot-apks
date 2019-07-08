import React, { Component } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import ChffrPlus from '../../native/ChffrPlus';
import { formatSize } from '../../utils/bytes';
import { mpsToKph, mpsToMph, kphToMps, mphToMps } from '../../utils/conversions';
import { Params } from '../../config';

import {
    updateSshEnabled,
} from '../../store/host/actions';
import {
    deleteParam,
    updateParam,
} from '../../store/params/actions';

import X from '../../themes';
import Styles from './SettingsStyles';

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
    monitoring: require('../../img/icon_monitoring.png'),
    metric: require('../../img/icon_metric.png'),
    network: require('../../img/icon_network.png'),
    eon: require('../../img/icon_eon.png'),
    calibration: require('../../img/icon_calibration.png'),
    speedLimit: require('../../img/icon_speed_limit.png'),
    plus: require('../../img/icon_plus.png'),
    minus: require('../../img/icon_minus.png'),
    mapSpeed: require('../../img/icon_map.png'),
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
        }
    }

    async componentWillMount() {
        const {
            isMetric,
            params: {
                SpeedLimitOffset: speedLimitOffset
            },
        } = this.props;

        if (isMetric) {
            this.setState({ speedLimitOffsetInt: parseInt(mpsToKph(speedLimitOffset)) })
        } else {
            this.setState({ speedLimitOffsetInt: parseInt(mpsToMph(speedLimitOffset)) })
        }
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

    handlePressedResetCalibration = async () => {
        this.props.deleteParam(Params.KEY_CALIBRATION_PARAMS);
        this.setState({ calibration: null });
        Alert.alert('重新啟動', '重設校準需要重新啟動。', [
            { text: '稍後', onPress: () => {}, style: 'cancel' },
            { text: '馬上', onPress: () => ChffrPlus.reboot() },
        ]);
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
        let connectivity = '已斷線'
        if (wifiState.isConnected && wifiState.ssid) {
            connectivity = wifiState.ssid;
        } else if (simState.networkType && simState.networkType != 'NO SIM') {
            connectivity = simState.networkType;
        }
        const settingsMenuItems = [
            {
                icon: Icons.user,
                title: '帳號',
                context: isPaired ? '已配對' : '未配對',
                route: SettingsRoutes.ACCOUNT,
            },
            {
                icon: Icons.eon,
                title: '裝置',
                context: `剩餘 ${ parseInt(freeSpace * 100) + '%' }`,
                route: SettingsRoutes.DEVICE,
            },
            {
                icon: Icons.network,
                title: '網路',
                context: connectivity,
                route: SettingsRoutes.NETWORK,
            },
            {
                icon: Icons.developer,
                title: '開發人員',
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
                IsDriverMonitoringEnabled: isDriverMonitoringEnabled,
                RecordFront: recordFront,
                IsFcwEnabled: isFcwEnabled,
                IsMetric: isMetric,
                LongitudinalControl: hasLongitudinalControl,
                LimitSetSpeed: limitSetSpeed,
                SpeedLimitOffset: speedLimitOffset,
                // dragonpilot
                DragonTempDisableSteerOnSignal: dragonTempDisableSteerOnSignal,
                DragonEnableDashcam: dragonEnableDashcam,
                DragonDisableDriverSafetyCheck: dragonDisableDriverSafetyCheck,
                DragonAutoShutdownAt: dragonAutoShutdownAt,
            }
        } = this.props;
        const { expandedCell, speedLimitOffsetInt } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  設定'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Table direction='row' color='darkBlue'>
                        { this.renderSettingsMenu() }
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='啟用駕駛監控'
                            value={ !!parseInt(isDriverMonitoringEnabled) }
                            iconSource={ Icons.monitoring }
                            description='駕駛監控系統利用 3D 人臉/姿態識別來判斷駕駛的狀態。當 openpilot 啟用時，它會在駕駛分心時發出警示。這個功能仍然在測試階段，所以監控會在無法正確識別時暫時取消 (例如光線不足時)。您可以從 EON 左下角的人臉圖示來判斷它的狀態。'
                            isExpanded={ expandedCell == 'driver_monitoring' }
                            handleExpanded={ () => this.handleExpanded('driver_monitoring') }
                            handleChanged={ this.props.setDriverMonitoringEnabled } />
                        <X.TableCell
                            type='switch'
                            title='錄制並上傳駕駛的錄像'
                            value={ !!parseInt(recordFront) }
                            iconSource={ Icons.network }
                            description='上傳前置相機的錄像來協助我們提升駕駛監控的準確率。'
                            isExpanded={ expandedCell == 'record_front' }
                            handleExpanded={ () => this.handleExpanded('record_front') }
                            handleChanged={ this.props.setRecordFront } />
                        <X.TableCell
                            type='switch'
                            title='啟用前方碰撞預警'
                            value={ !!parseInt(isFcwEnabled) }
                            iconSource={ Icons.warning }
                            description='當檢測到前方有碰撞的風險時，使用視覺和音效來警示。'
                            isExpanded={ expandedCell == 'fcw' }
                            handleExpanded={ () => this.handleExpanded('fcw') }
                            handleChanged={ this.props.setFcwEnabled } />
                        <X.TableCell
                            type='switch'
                            title='使用公/米制單位'
                            value={ !!parseInt(isMetric) }
                            iconSource={ Icons.metric }
                            description='開啟時，顯示 km/h (速度) 或 °C (溫度)，關閉時，顯示 mph (速度) 或 °F (溫度)。'
                            isExpanded={ expandedCell == 'metric' }
                            handleExpanded={ () => this.handleExpanded('metric') }
                            handleChanged={ this.props.setMetric } />
                        <X.TableCell
                            type='switch'
                            title='方向燈暫時取消方向盤控制'
                            value={ !!parseInt(dragonTempDisableSteerOnSignal) }
                            iconSource={ Icons.developer }
                            description='當方向燈亮起時，暫時取消方向盤控制，OP 將會在方向燈熄滅後 1 秒取回控制。'
                            isExpanded={ expandedCell == 'disable_on_signal' }
                            handleExpanded={ () => this.handleExpanded('disable_on_signal') }
                            handleChanged={ this.props.setDisableOnSignal } />
                        <X.TableCell
                            type='switch'
                            title='啟用行車記錄'
                            value={ !!parseInt(dragonEnableDashcam) }
                            iconSource={ Icons.developer }
                            description='錄下 EON 的畫面當做行車記錄，當系統的空間不足 15% 時會自動刪除舊的記錄。'
                            isExpanded={ expandedCell == 'dashcam' }
                            handleExpanded={ () => this.handleExpanded('dashcam') }
                            handleChanged={ this.props.setEnableDashcam } />
                        <X.TableCell
                            type='switch'
                            title='啟用睡覺模式'
                            value={ !!parseInt(dragonDisableDriverSafetyCheck) }
                            iconSource={ Icons.developer }
                            description='這個功能將會完全取消駕駛監控，除非你知道你在做什麼，不然我們不建議你使用，我們也不會負任何事故的責任。'
                            isExpanded={ expandedCell == 'safetyCheck' }
                            handleExpanded={ () => this.handleExpanded('safetyCheck') }
                            handleChanged={ this.props.setDriverSafetyCheck } />
                        <X.TableCell
                            type='switch'
                            title='啟用自動關機'
                            value={ parseInt(dragonAutoShutdownAt) > 0 }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，當 Panda 的 USB 停止供電時 EON 將會在 30 分鐘後自動關機。'
                            isExpanded={ expandedCell == 'autoShutdown' }
                            handleExpanded={ () => this.handleExpanded('autoShutdown') }
                            handleChanged={ this.props.setAutoShutdown } />
                      </X.Table>
                      {/*
                      <X.Table color='darkBlue'>
                        <X.TableCell
                            type='custom'
                            title='速限補償'
                            iconSource={ Icons.speedLimit }
                            description='當 EON 從圖資讀到路段速限時，您可以利用速限補償來微調定速 (單位是 km/h 或 mph)'
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
                            title='Use Map To Control Vehicle Speed'
                            value={ !!parseInt(limitSetSpeed) }
                            isDisabled={ !parseInt(hasLongitudinalControl) }
                            iconSource={ Icons.mapSpeed }
                            description='使用圖資來控制當前的車速。當您見到一個彎道圖示時，代表車子將會自動減速來過前方的彎道。當取得圖資資料後，車速將被限制在圖資上的速限 (外加速限補償設置)。這功能需要有網路連線以及能讓 openpilot 橫向控制的對應車種。當圖資下載完成後，您將會看到一個地圖圖示。'
                            isExpanded={ expandedCell == 'limitSetSpeed' }
                            handleExpanded={ () => this.handleExpanded('limitSetSpeed') }
                            handleChanged={ this.props.setLimitSetSpeed } />
                    </X.Table>
                    */}
                    <X.Table color='darkBlue'>
                        <X.Button
                            color='settingsDefault'
                            onPress={ () => this.props.openTrainingGuide() }>
                            查看使用教學
                        </X.Button>
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ () => this.props.reboot() }>
                            重新啟動
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini' />
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ () => this.props.shutdown() }>
                            關機
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
                        {'<  帳號設定'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <View>
                        <X.Table>
                            <X.TableCell
                                title='已登錄裝置'
                                value={ isPaired ? '是' : '否' } />
                        </X.Table>
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
        const software = !!parseInt(isPassive) ? 'chffrplus' : 'openpilot';
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  裝置設定'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='custom'
                            title='相機校準'
                            iconSource={ Icons.calibration }
                            description='相機是一直在背後自動校準的。只有當您的 EON 發出校準無效的訊息或是您將 EON 安裝至不同的位置/車子時，才需要重設校準。'
                            isExpanded={ expandedCell == 'calibration' }
                            handleExpanded={ () => this.handleExpanded('calibration') }>
                            <X.Button
                                size='tiny'
                                color='settingsDefault'
                                onPress={ this.handlePressedResetCalibration  }
                                style={ { minWidth: '100%' } }>
                                Reset
                            </X.Button>
                        </X.TableCell>
                    </X.Table>
                    <X.Table>
                        <X.TableCell
                            title='已配對'
                            value={ isPaired ? '是' : '否' } />
                        <X.TableCell
                            title='Dongle ID'
                            value={ dongleId } />
                        <X.TableCell
                            title='序號'
                            value={ serialNumber } />
                        <X.TableCell
                            title='剩餘空間'
                            value={ parseInt(freeSpace * 100) + '%' }
                             />
                        <X.TableCell
                            title='上傳速度'
                            value={ txSpeedKbps + ' kbps' }
                             />
                    </X.Table>
                    <X.Table color='darkBlue' padding='big'>
                        <X.Button
                            color='settingsDefault'
                            size='small'
                            onPress={ () => ChffrPlus.openDateTimeSettings() }>
                            Open Date and Time Settings
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderNetworkSettings() {
        const {
          params: {
            IsUploadVideoOverCellularEnabled: isCellularUploadEnabled,
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
                        {'<  網路設定'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='允許使用手機網路上傳記錄'
                            value={ !!parseInt(isCellularUploadEnabled) }
                            iconSource={ Icons.network }
                            description='當您的 EON 有安裝 SIM 卡卻沒有無線網路連線時，這個選項將允許 EON 使用手機網路上傳記錄。如果您非使用吃到飽方案，您可能需付額外的費用。'
                            isExpanded={ expandedCell == 'cellular_enabled' }
                            handleExpanded={ () => this.handleExpanded('cellular_enabled') }
                            handleChanged={ this.props.setCellularEnabled } />
                    </X.Table>
                    <X.Table spacing='big' color='darkBlue'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ () => ChffrPlus.openWifiSettings() }>
                            Open WiFi Settings
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini' />
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={ () => ChffrPlus.openTetheringSettings() }>
                            Open Tethering Settings
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
            },
        } = this.props;
        const { expandedCell } = this.state;
        const software = !!parseInt(isPassive) ? 'chffrplus' : 'openpilot';
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  開發人員設定'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Table spacing='none'>
                        <X.TableCell
                            title='版本'
                            value={ `${ software } v${ version }` } />
                        <X.TableCell
                            title='Git 分支'
                            value={ gitBranch } />
                        <X.TableCell
                            title='Git 修訂版'
                            value={ gitRevision.slice(0, 12) }
                            valueTextSize='tiny' />
                        <X.TableCell
                            title='中文化'
                            value='Rick Lan (https://github.com/efiniLan/)'
                            valueTextSize='tiny' />
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='啟用 SSH'
                            value={ isSshEnabled }
                            iconSource={ Icons.developer }
                            description='允許別的裝置經由 Secure Shell (SSH) 連線至您的 EON。'
                            isExpanded={ expandedCell == 'ssh' }
                            handleExpanded={ () => this.handleExpanded('ssh') }
                            handleChanged={ this.props.setSshEnabled } />
                    </X.Table>
                    <X.Table color='darkBlue' padding='big'>
                        <X.Button
                            color='settingsDefault'
                            size='small'
                            onPress={ this.props.uninstall }>
                            { `卸載 ${ software }` }
                        </X.Button>
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
    isUpdateAvailable: state.updater.isUpdateAvailable,

    // Uploader
    txSpeedKbps: parseInt(state.uploads.txSpeedKbps),
    freeSpace: state.host.thermal.freeSpace,

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
    reboot: () => {
        Alert.alert('重新啟動', '您確定要重新啟動嗎?', [
            { text: '取消', onPress: () => {}, style: 'cancel' },
            { text: '重新啟動', onPress: () => ChffrPlus.reboot() },
        ]);
    },
    shutdown: () => {
        Alert.alert('關機', '您確定要關機嗎?', [
            { text: '取消', onPress: () => {}, style: 'cancel' },
            { text: '關機', onPress: () => ChffrPlus.shutdown() },
        ]);
    },
    uninstall: () => {
        Alert.alert('卸載', '您確定要卸載嗎?', [
            { text: '取消', onPress: () => {}, style: 'cancel' },
            { text: '卸載', onPress: () => ChffrPlus.writeParam(Params.KEY_DO_UNINSTALL, "1") },
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
    setDriverMonitoringEnabled: (isDriverMonitoringEnabled) => {
        const value = (isDriverMonitoringEnabled | 0).toString();
        dispatch(updateParam(Params.KEY_IS_DRIVER_MONITORING_ENABLED, value));
    },
    setFcwEnabled: (isFcwEnabled) => {
        dispatch(updateParam(Params.KEY_IS_FCW_ENABLED, (isFcwEnabled | 0).toString()));
    },
    setMetric: (useMetricUnits) => {
        dispatch(updateParam(Params.KEY_IS_METRIC, (useMetricUnits | 0).toString()));
    },
    setRecordFront: (recordFront) => {
        dispatch(updateParam(Params.KEY_RECORD_FRONT, (recordFront | 0).toString()));
    },
    setCellularEnabled: (useCellular) => {
        dispatch(updateParam(Params.KEY_UPLOAD_CELLULAR, (useCellular | 0).toString()));
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

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
