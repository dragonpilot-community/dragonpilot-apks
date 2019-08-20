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
    // HONDA: 'HONDA',
    UI: 'UI',
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
        }
    }

    async componentWillMount() {
        const {
            params: {
                DragonSteeringMonitorTimer: dragonSteeringMonitorTimer
            },
        } = this.props;
        this.setState({ steeringMonitorTimerInt: parseInt(dragonSteeringMonitorTimer) || 3 })
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

    renderSettingsMenu() {
        const settingsMenuItems = [
            {
                icon: Icons.developer,
                title: 'Toyota/Lexus',
                context: '',
                route: SettingsRoutes.TOYOTA,
            },
            // {
            //     icon: Icons.developer,
            //     title: 'Honda',
            //     context: '',
            //     route: SettingsRoutes.HONDA,
            // },
            {
                icon: Icons.developer,
                title: '介面',
                context: '',
                route: SettingsRoutes.UI,
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
                DragonLatCtrl: dragonLatCtrl,
                DragonAllowGas: dragonAllowGas,
                DragonEnableLogger: dragonEnableLogger,
                DragonEnableUploader: dragonEnableUploader,
                DragonEnableSteeringOnSignal: dragonEnableSteeringOnSignal,
                DragonEnableDashcam: dragonEnableDashcam,
                DragonEnableDriverSafetyCheck: dragonEnableDriverSafetyCheck,
                DragonAutoShutdownAt: dragonAutoShutdownAt,
                DragonNoctuaMode: dragonNoctuaMode,
                DragonCacheCar: dragonCacheCar,
                DragonBootTomTom: dragonBootTomTom,
                DragonBootAutonavi: dragonBootAutonavi,
                DragonSteeringMonitorTimer: dragonSteeringMonitorTimer,
            }
        } = this.props;
        const { expandedCell, steeringMonitorTimerInt } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  Dragonpilot 設定'}
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
                            title='繁體中文化'
                            value='Rick Lan (https://github.com/efinilan/)'
                            valueTextSize='tiny' />
                    </X.Table>
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='啟用橫向控制'
                            value={ !!parseInt(dragonLatCtrl) }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，dp 將可以控制您的方向盤。'
                            isExpanded={ expandedCell == 'lat_ctrl' }
                            handleExpanded={ () => this.handleExpanded('lat_ctrl') }
                            handleChanged={ this.props.setLatCtrl } />
                        <X.TableCell
                            type='switch'
                            title='允許踩油門'
                            value={ !!parseInt(dragonAllowGas) }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，當 dp 在控制時您仍然可以踩油門。'
                            isExpanded={ expandedCell == 'allow_gas' }
                            handleExpanded={ () => this.handleExpanded('allow_gas') }
                            handleChanged={ this.props.setAllowGas } />
                        <X.TableCell
                            type='switch'
                            title='啟用記錄服務'
                            value={ !!parseInt(dragonEnableLogger) }
                            iconSource={ Icons.developer }
                            description='如果您關閉這個選項，記錄服務將停止儲存用來訓練 AI 模式的資料，需要重新開機。'
                            isExpanded={ expandedCell == 'enable_logger' }
                            handleExpanded={ () => this.handleExpanded('enable_logger') }
                            handleChanged={ this.props.setEnableLogger } />
                        <X.TableCell
                            type='switch'
                            title='啟用上傳記錄服務'
                            value={ !!parseInt(dragonEnableUploader) }
                            iconSource={ Icons.developer }
                            description='如果您關閉這個選項，上傳記錄服務將停止上傳用來訓練 AI 模式的資料，需要重新開機。'
                            isExpanded={ expandedCell == 'enable_uploader' }
                            handleExpanded={ () => this.handleExpanded('enable_uploader') }
                            handleChanged={ this.props.setEnableUploader } />
                        <X.TableCell
                            type='switch'
                            title='啟用方向燈暫時取消方向盤控制'
                            value={ !!parseInt(dragonEnableSteeringOnSignal) }
                            iconSource={ Icons.developer }
                            description='如果您啟用這個選項，當方向燈亮起時，將暫時取消 DP 的方向盤控制，然後 DP 會在方向燈熄滅後 1 秒取回控制。'
                            isExpanded={ expandedCell == 'enable_steering_on_signal' }
                            handleExpanded={ () => this.handleExpanded('enable_steering_on_signal') }
                            handleChanged={ this.props.setEnableSteeringOnSignal } />
                        <X.TableCell
                            type='switch'
                            title='啟用行車記錄'
                            value={ !!parseInt(dragonEnableDashcam) }
                            iconSource={ Icons.developer }
                            description='錄下 EON 的畫面當做行車記錄，當系統的空間不足 15% 時會自動刪除舊的記錄。記錄會存在 /sdcard/dashcam/ 裡。'
                            isExpanded={ expandedCell == 'dashcam' }
                            handleExpanded={ () => this.handleExpanded('dashcam') }
                            handleChanged={ this.props.setEnableDashcam } />
                        <X.TableCell
                            type='switch'
                            title='啟用安全監控'
                            value={ !!parseInt(dragonEnableDriverSafetyCheck) }
                            iconSource={ Icons.developer }
                            description='如果您關閉這個選項，DP 的駕駛監控功能將完全取消，除非您知道您在做什麼，不然我們不建議您使用，我們也不會負任何事故的責任。'
                            isExpanded={ expandedCell == 'safetyCheck' }
                            handleExpanded={ () => this.handleExpanded('safetyCheck') }
                            handleChanged={ this.props.setEnableDriverSafetyCheck } />
                        <X.TableCell
                            type='switch'
                            title='啟用自動關機'
                            value={ parseInt(dragonAutoShutdownAt) > 0 }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，當 Panda 的 USB 停止供電時 EON 將會在 30 分鐘後自動關機。'
                            isExpanded={ expandedCell == 'autoShutdown' }
                            handleExpanded={ () => this.handleExpanded('autoShutdown') }
                            handleChanged={ this.props.setAutoShutdown } />
                        <X.TableCell
                            type='switch'
                            title='啟用 Noctua 風扇模式'
                            value={ !!parseInt(dragonNoctuaMode) }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，EON 的風扇將會一直以全速運轉，這個功能適合有改裝 Noctua 風扇的用戶，需要重新開機。'
                            isExpanded={ expandedCell == 'enable_noctua_mode' }
                            handleExpanded={ () => this.handleExpanded('enable_noctua_mode') }
                            handleChanged={ this.props.setNoctuaMode } />
                        <X.TableCell
                            type='switch'
                            title='啟用指紋暫存'
                            value={ !!parseInt(dragonCacheCar) }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，dp 將會把您車子的指紋暫存起來加快載入速度，如果更新版本後車子不能識別，請將本功能關閉，等車子能識別後再打開。'
                            isExpanded={ expandedCell == 'cache_fingerprint' }
                            handleExpanded={ () => this.handleExpanded('cache_fingerprint') }
                            handleChanged={ this.props.setCacheCar } />
                        <X.TableCell
                            type='switch'
                            title='開機啟動 TomTom'
                            value={ !!parseInt(dragonBootTomTom) }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，TomTom 將在開機後自動啟動。'
                            isExpanded={ expandedCell == 'run_tomtom' }
                            handleExpanded={ () => this.handleExpanded('run_tomtom') }
                            handleChanged={ this.props.setTomTom } />
                        <X.TableCell
                            type='switch'
                            title='開機啟動高德地圖'
                            value={ !!parseInt(dragonBootAutonavi) }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，高德地圖將在開機後自動啟動。'
                            isExpanded={ expandedCell == 'run_autonavi' }
                            handleExpanded={ () => this.handleExpanded('run_autonavi') }
                            handleChanged={ this.props.setAutonavi } />
                    </X.Table>
                    <X.Table color='darkBlue'>
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
                                style={ Styles.settingsSteeringMonitorTimer }>
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
                        {'<  Toyota/Lexus 設定'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='啟用原廠 DSU 模式'
                            value={ !!parseInt(dragonToyotaStockDSU) }
                            iconSource={ Icons.developer }
                            description='某些車型 (Lexus IS/GS/ES) 的 DSU 無法拔除，開啟這個選項後，您可以使用 AHB (自動大燈) 來控制 dp，當 AHB 開啟後，dp 將會一直開啟, 您可以手動控制油門和剎車。AHB 關閉後，dp 將會暫時切回原本的模式 (油門/剎車會取消 dp)。'
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
        const { expandedCell } = this.state;
        return (
            <View style={ Styles.settings }>
                <View style={ Styles.settingsHeader }>
                    <X.Button
                        color='ghost'
                        size='small'
                        onPress={ () => this.handlePressedBack() }>
                        {'<  介面設定'}
                    </X.Button>
                </View>
                <ScrollView
                    ref="settingsScrollView"
                    style={ Styles.settingsWindow }>
                    <X.Line color='transparent' spacing='tiny' />
                    <X.Table color='darkBlue'>
                        <X.TableCell
                            type='switch'
                            title='顯示事件／方向盤圖示'
                            value={ !!parseInt(dragonUIEvent) }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，畫面將會顯示事件／方向盤圖示。'
                            isExpanded={ expandedCell == 'dragon_ui_event' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_event') }
                            handleChanged={ this.props.setUIEvent } />
                        <X.TableCell
                            type='switch'
                            title='顯示巡航速度'
                            value={ !!parseInt(dragonUIMaxSpeed) }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，畫面將會顯示巡航速度。'
                            isExpanded={ expandedCell == 'dragon_ui_maxspeed' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_maxspeed') }
                            handleChanged={ this.props.setUIMaxSpeed } />
                        <X.TableCell
                            type='switch'
                            title='顯示人臉圖示'
                            value={ !!parseInt(dragonUIFace) }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，畫面將會顯示人臉圖示。'
                            isExpanded={ expandedCell == 'dragon_ui_face' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_face') }
                            handleChanged={ this.props.setUIFace } />
                        <X.TableCell
                            type='switch'
                            title='顯示調校介面'
                            value={ !!parseInt(dragonUIDev) }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，畫面將會顯示類似於 kegman / arne 的調校介面。'
                            isExpanded={ expandedCell == 'dragon_ui_dev' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_dev') }
                            handleChanged={ this.props.setUIDev } />
                        <X.TableCell
                            type='switch'
                            title='顯示 dp 介面'
                            value={ !!parseInt(dragonUIDevMini) }
                            iconSource={ Icons.developer }
                            description='啟用這個選項後，畫面將會顯示 dp 的調校介面。'
                            isExpanded={ expandedCell == 'dragon_ui_dev_mini' }
                            handleExpanded={ () => this.handleExpanded('dragon_ui_dev_mini') }
                            handleChanged={ this.props.setUIDevMini } />
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
            case SettingsRoutes.TOYOTA:
                return this.renderToyotaSettings();
            // case SettingsRoutes.HONDA:
            //     return this.renderHondaSettings();
            case SettingsRoutes.UI:
                return this.renderUISettings();
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
        dispatch(updateParam(Params.KEY_AUTO_SHUTDOWN, (autoShutdown? 30 : 0).toString()));
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
    setTomTom: (val) => {
        dispatch(updateParam(Params.KEY_BOOT_TOMTOM, (val | 0).toString()));
    },
    setAutonavi: (val) => {
        dispatch(updateParam(Params.KEY_BOOT_AUTONAVI, (val | 0).toString()));
    },
    setSteeringMonitorTimer: (val) => {
        dispatch(updateParam(Params.KEY_STEERING_MONITOR_TIMER, (val).toString()));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(DragonpilotSettings);
