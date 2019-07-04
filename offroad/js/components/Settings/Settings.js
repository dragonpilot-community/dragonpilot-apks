import React, {Component} from 'react';
import {View, ScrollView, Alert} from 'react-native';
import {NavigationActions} from 'react-navigation';
import {connect} from 'react-redux';

import ChffrPlus from '../../native/ChffrPlus';
import {formatSize} from '../../utils/bytes';
import {mpsToKph, mpsToMph, kphToMps, mphToMps} from '../../utils/conversions';
import {Params} from '../../config';

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
            this.setState({speedLimitOffsetInt: parseInt(mpsToKph(speedLimitOffset))})
        } else {
            this.setState({speedLimitOffsetInt: parseInt(mpsToMph(speedLimitOffset))})
        }
    }

    handleExpanded(key) {
        const {expandedCell} = this.state;
        return this.setState({
            expandedCell: expandedCell == key ? null : key,
        })
    }

    handlePressedBack() {
        const {route} = this.state;
        if (route == SettingsRoutes.PRIMARY) {
            ChffrPlus.sendBroadcast("ai.comma.plus.offroad.NAVIGATED_FROM_SETTINGS");
            this.props.navigateHome();
        } else {
            this.handleNavigatedFromMenu(SettingsRoutes.PRIMARY);
        }
    }

    handleNavigatedFromMenu(route) {
        this.setState({route: route})
        this.refs.settingsScrollView.scrollTo({x: 0, y: 0, animated: false})
    }

    handlePressedResetCalibration = async () => {
        this.props.deleteParam(Params.KEY_CALIBRATION_PARAMS);
        this.setState({calibration: null});
        Alert.alert('Reboot', 'Resetting calibration requires a reboot.', [
            {
                text: 'Later', onPress: () => {
                }, style: 'cancel'
            },
            {text: 'Reboot Now', onPress: () => ChffrPlus.reboot()},
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
        let connectivity = 'Disconnected'
        if (wifiState.isConnected && wifiState.ssid) {
            connectivity = wifiState.ssid;
        } else if (simState.networkType && simState.networkType != 'NO SIM') {
            connectivity = simState.networkType;
        }
        const settingsMenuItems = [
            {
                icon: Icons.user,
                title: '账户',
                context: isPaired ? '已配对' : '未配对',
                route: SettingsRoutes.ACCOUNT,
            },
            {
                icon: Icons.eon,
                title: '设备存储',
                context: `剩余 ${parseInt(freeSpace * 100) + '%'}`,
                route: SettingsRoutes.DEVICE,
            },
            {
                icon: Icons.network,
                title: '网络',
                context: connectivity,
                route: SettingsRoutes.NETWORK,
            },
            {
                icon: Icons.developer,
                title: '开发人员设置',
                context: `${software} v${version.split('-')[0]}`,
                route: SettingsRoutes.DEVELOPER,
            },
        ];
        return settingsMenuItems.map((item, idx) => {
            const cellButtonStyle = [
                Styles.settingsMenuItem,
                idx == 3 ? Styles.settingsMenuItemBorderless : null,
            ]
            return (
                <View key={idx} style={cellButtonStyle}>
                    <X.Button
                        color='transparent'
                        size='full'
                        style={Styles.settingsMenuItemButton}
                        onPress={() => this.handleNavigatedFromMenu(item.route)}>
                        <X.Image
                            source={item.icon}
                            style={Styles.settingsMenuItemIcon}/>
                        <X.Text
                            color='white'
                            size='small'
                            weight='semibold'
                            style={Styles.settingsMenuItemTitle}>
                            {item.title}
                        </X.Text>
                        <X.Text
                            color='white'
                            size='tiny'
                            weight='light'
                            style={Styles.settingsMenuItemContext}>
                            {item.context}
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
            }
        } = this.props;
        const {expandedCell, speedLimitOffsetInt} = this.state;
        return (
            <View style={Styles.settings}>
                <View style={Styles.settingsHeader}>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={() => this.handlePressedBack()}>
                        {'<  设置'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={Styles.settingsWindow}>
                    <X.Table direction='row' color='darkBlue'>
                        {this.renderSettingsMenu()}
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='驾驶员监控'
                            value={!!parseInt(isDriverMonitoringEnabled)}
                            iconSource={Icons.monitoring}
                            description='{\n\"}驾驶员监控通过三维人脸重建和姿态估计来检测驾驶员的感知。当openpilot被占用时，当驾驶员出现分心时，它会发出警告。这一功能仍处于测试阶段，所以当面部跟踪太不准确时(比如在晚上)，司机监控是不可用的。可用性由左下角的face图标指示。'
                            isExpanded={expandedCell == 'driver_monitoring'}
                            handleExpanded={() => this.handleExpanded('driver_monitoring')}
                            handleChanged={this.props.setDriverMonitoringEnabled}/>
                        <X.TableCell
                            type='switch'
                            title='记录并上传摄像头信息'
                            value={!!parseInt(recordFront)}
                            iconSource={Icons.network}
                            description='上传面向摄像头的司机数据，帮助改进司机监控算法。'
                            isExpanded={expandedCell == 'record_front'}
                            handleExpanded={() => this.handleExpanded('record_front')}
                            handleChanged={this.props.setRecordFront}/>
                        <X.TableCell
                            type='switch'
                            title='碰撞警告'
                            value={!!parseInt(isFcwEnabled)}
                            iconSource={Icons.warning}
                            description='当发现前方有碰撞危险时，使用视觉和听觉警告。'
                            isExpanded={expandedCell == 'fcw'}
                            handleExpanded={() => this.handleExpanded('fcw')}
                            handleChanged={this.props.setFcwEnabled}/>
                        <X.TableCell
                            type='switch'
                            title='使用公里制'
                            value={!!parseInt(isMetric)}
                            iconSource={Icons.metric}
                            description='显示速度用km/h代替mp/h，温度用°C代替°F。'
                            isExpanded={expandedCell == 'metric'}
                            handleExpanded={() => this.handleExpanded('metric')}
                            handleChanged={this.props.setMetric}/>
                    </X.Table>
                    {/*
                      <X.Table color='darkBlue'>
                        <X.TableCell
                            type='custom'
                            title='Add Speed Limit Offset'
                            iconSource={ Icons.speedLimit }
                            description='Customize the default speed limit warning with an offset in km/h or mph above the posted legal limit when available.'
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
                            description='Use map data to control the vehicle speed. A curvy road icon appears when the car automatically slows down for upcoming turns. The vehicle speed is also limited by the posted legal limit, when available, including the custom offset. This feature is only available for cars where openpilot manages longitudinal control and when EON has internet connectivity. The map icon appears when map data are downloaded.'
                            isExpanded={ expandedCell == 'limitSetSpeed' }
                            handleExpanded={ () => this.handleExpanded('limitSetSpeed') }
                            handleChanged={ this.props.setLimitSetSpeed } />
                    </X.Table>
                    */}
                    <X.Table color='darkBlue'>
                        <X.Button
                            color='settingsDefault'
                            onPress={() => this.props.openTrainingGuide()}>
                            回顾培训指南{/*Review Training Guide*/}
                        </X.Button>
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={() => this.props.reboot()}>
                            重启
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini'/>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={() => this.props.shutdown()}>
                            关机
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderAccountSettings() {
        const {isPaired} = this.props;
        const {expandedCell} = this.state;
        return (
            <View style={Styles.settings}>
                <View style={Styles.settingsHeader}>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={() => this.handlePressedBack()}>
                        {'<  账户设置'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={Styles.settingsWindow}>
                    <View>
                        <X.Table>
                            <X.TableCell
                                title='设备配对'
                                value={isPaired ? 'Yes' : 'No'}/>
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
            <View style={Styles.settings}>
                <View style={Styles.settingsHeader}>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={() => this.handlePressedBack()}>
                        {'<  设备设置'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={Styles.settingsWindow}>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='custom'
                            title='摄像机标定'
                            iconSource={Icons.calibration}
                            description='标定算法在面对摄像机的道路上始终处于活跃状态。只有当报告了一个无效的校准警报，或者在不同的位置重新安装时，才会建议重置校准。'
                            isExpanded={expandedCell == 'calibration'}
                            handleExpanded={() => this.handleExpanded('calibration')}>
                            <X.Button
                                size='tiny'
                                color='settingsDefault'
                                onPress={this.handlePressedResetCalibration}
                                style={{minWidth: '100%'}}>
                                重置
                            </X.Button>
                        </X.TableCell>
                    </X.Table>
                    <X.Table>
                        <X.TableCell
                            title='配对'
                            value={isPaired ? 'Yes' : 'No'}/>
                        <X.TableCell
                            title='ID'
                            value={dongleId}/>
                        <X.TableCell
                            title='序列号'
                            value={serialNumber}/>
                        <X.TableCell
                            title='剩余存储空间'
                            value={parseInt(freeSpace * 100) + '%'}
                        />
                        <X.TableCell
                            title='上传速度'
                            value={txSpeedKbps + ' kbps'}
                        />
                    </X.Table>
                    <X.Table color='darkBlue' padding='big'>
                        <X.Button
                            color='settingsDefault'
                            size='small'
                            onPress={() => ChffrPlus.openDateTimeSettings()}>
                            日期和时间设置
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
        const {expandedCell} = this.state;
        return (
            <View style={Styles.settings}>
                <View style={Styles.settingsHeader}>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={() => this.handlePressedBack()}>
                        {'<  网络设置'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={Styles.settingsWindow}>
                    <X.Line color='transparent' spacing='tiny'/>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='手机上传'
                            value={!!parseInt(isCellularUploadEnabled)}
                            iconSource={Icons.network}
                            description='Upload driving data over cellular connection if a sim card is used and no wifi network is available. If you have a limited data plan, you might incur in surcharges.'
                            isExpanded={expandedCell == 'cellular_enabled'}
                            handleExpanded={() => this.handleExpanded('cellular_enabled')}
                            handleChanged={this.props.setCellularEnabled}/>
                    </X.Table>
                    <X.Table spacing='big' color='darkBlue'>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={() => ChffrPlus.openWifiSettings()}>
                            WiFi设置
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini'/>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={() => ChffrPlus.openBluetoothSettings()}>
                            蓝牙设置
                        </X.Button>
                        <X.Line color='transparent' size='tiny' spacing='mini'/>
                        <X.Button
                            size='small'
                            color='settingsDefault'
                            onPress={() => ChffrPlus.openTetheringSettings()}>
                            共享设置
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
        const {expandedCell} = this.state;
        const software = !!parseInt(isPassive) ? 'chffrplus' : 'openpilot';
        return (
            <View style={Styles.settings}>
                <View style={Styles.settingsHeader}>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={() => this.handlePressedBack()}>
                        {'<  开发人员设置'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={Styles.settingsWindow}>
                    <X.Table spacing='none'>
                        <X.TableCell
                            title='版本'
                            value={`${software} v${version}`}/>
                        <X.TableCell
                            title='Git分支'
                            value={gitBranch}/>
                        <X.TableCell
                            title='Git修订版'
                            value={gitRevision.slice(0, 12)}
                            valueTextSize='tiny'/>
                        <X.TableCell
                            title='简体中文化'
                            value='dinglx(https://github.com/dingliangxue/)'
                            valueTextSize='tiny'/>
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='SSH'
                            value={isSshEnabled}
                            iconSource={Icons.developer}
                            description='Allow devices to connect to your EON using Secure Shell (SSH).'
                            isExpanded={expandedCell == 'ssh'}
                            handleExpanded={() => this.handleExpanded('ssh')}
                            handleChanged={this.props.setSshEnabled}/>
                    </X.Table>
                    <X.Table color='darkBlue' padding='big'>
                        <X.Button
                            color='settingsDefault'
                            size='small'
                            onPress={this.props.uninstall}>
                            {`卸载 ${software}`}
                        </X.Button>
                    </X.Table>
                </ScrollView>
            </View>
        )
    }

    renderSettingsByRoute() {
        const {route} = this.state;
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
                {this.renderSettingsByRoute()}
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
                NavigationActions.navigate({routeName: 'Home'})
            ]
        }));
    },
    reboot: () => {
        Alert.alert('重启', '确认重启？', [
            {
                text: '取消', onPress: () => {
                }, style: 'cancel'
            },
            {text: '重启', onPress: () => ChffrPlus.reboot()},
        ]);
    },
    shutdown: () => {
        Alert.alert('关机', '确认关机？', [
            {
                text: '取消', onPress: () => {
                }, style: 'cancel'
            },
            {text: '关机', onPress: () => ChffrPlus.shutdown()},
        ]);
    },
    uninstall: () => {
        Alert.alert('卸载', '确认卸载？', [
            {
                text: '取消', onPress: () => {
                }, style: 'cancel'
            },
            {text: '卸载', onPress: () => ChffrPlus.writeParam(Params.KEY_DO_UNINSTALL, "1")},
        ]);
    },
    openTrainingGuide: () => {
        dispatch(NavigationActions.reset({
            index: 0,
            key: null,
            actions: [
                NavigationActions.navigate({routeName: 'Onboarding'})
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
