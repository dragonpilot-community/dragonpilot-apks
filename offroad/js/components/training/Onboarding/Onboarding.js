import React, { Component } from 'react';
import { View, Animated } from 'react-native';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';

import ChffrPlus from '../../..//native/ChffrPlus';
import { completeTrainingStep } from '../step';
import { onTrainingRouteCompleted } from '../../../utils/version';

import X from '../../../themes';
import Styles from './OnboardingStyles';

const Step = {
    OB_SPLASH: 'OB_SPLASH',
    OB_INTRO: 'OB_INTRO',
    OB_SENSORS: 'OB_SENSORS',
    OB_CONTROLS: 'OB_CONTROLS',
    OB_OUTRO: 'OB_OUTRO',
};

class Onboarding extends Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            step: Step.OB_SPLASH,
            stepPoint: 0,
            stepChecks: [],
            engagedMocked: false,
            photoOffset: new Animated.Value(0),
            photoCycled: new Animated.Value(0),
            photoCycledLast: new Animated.Value(0),
            leadEntered: new Animated.Value(0),
            gateHighlighted: new Animated.Value(0),
        };
    }

    componentWillUnmount() {
        this.handleEngagedMocked(false);
    }

    setStep(step) {
        this.setState({
            step: '',
            stepChecks: [],
        }, () => {
            return this.setState({ step });
        });
        this.handleEngagedMocked(false);
    }

    setStepPoint(stepPoint) {
        this.setState({
            stepPoint: 0,
        }, () => {
            return this.setState({ stepPoint });
        })
    }

    handleRestartPressed = () => {
        this.props.restartTraining();
        this.setStep('OB_SPLASH');
    }

    handleIntroCheckboxPressed(stepCheck) {
        const { stepChecks } = this.state;
        if (stepChecks.indexOf(stepCheck) === -1) {
            const newStepChecks = [...stepChecks, stepCheck];
            this.setState({ stepChecks: newStepChecks });
            if (newStepChecks.length == 3) {
                setTimeout(() => {
                    this.setStep('OB_SENSORS');
                }, 300)
            }
        } else {
            stepChecks.splice(stepChecks.indexOf(stepCheck), 1);
            this.setState({ stepChecks });
        }
    }

    handleSensorRadioPressed(option) {
        switch(option) {
            case 'index':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                return this.setStepPoint(0); break;
            case 'camera':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(0);
                return this.setStepPoint(1); break;
            case 'radar':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                this.animateLeadEntered(100);
                return this.setStepPoint(2); break;
        }
    }

    handleSensorVisualPressed(visual) {
        const { stepChecks } = this.state;
        const hasCheck = (stepChecks.indexOf(visual) > -1);
        if (stepChecks.length > 0 && !hasCheck) {
            this.animatePhotoOffset(0);
            this.setState({ stepChecks: [...stepChecks, visual] });
            this.setStepPoint(0);
            return this.setStep('OB_CONTROLS');
        } else {
            this.setState({ stepChecks: [...stepChecks, visual] });
            switch(visual) {
                case 'camera':
                    this.animatePhotoCycled(100);
                    this.animateLeadEntered(100);
                    return this.setStepPoint(2); break;
                case 'radar':
                    this.animatePhotoOffset(0);
                    this.animateLeadEntered(0);
                    this.animatePhotoCycled(0);
                    return this.setStepPoint(0); break;
            }
        }
    }

    handleControlsRadioPressed(option) {
        switch(option) {
            case 'index':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                this.animatePhotoCycledLast(0);
                return this.setStepPoint(0); break;
            case 'cruise':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(0);
                return this.setStepPoint(1); break;
            case 'monitoring':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                return this.setStepPoint(2); break;
            case 'pedal':
                this.animatePhotoOffset(100);
                this.animatePhotoCycledLast(100);
                return this.setStepPoint(3); break;
        }
    }

    handleControlsVisualPressed(visual) {
        const { stepChecks } = this.state;
        const hasCheck = (stepChecks.indexOf(visual) > -1);
        this.setState({ stepChecks: [...stepChecks, visual] });
        switch(visual) {
            case 'cruise':
                this.animatePhotoCycled(100);
                this.handleEngagedMocked(true);
                return this.setStepPoint(2); break;
            case 'monitoring':
                this.animatePhotoOffset(100);
                this.animatePhotoCycled(100);
                this.animatePhotoCycledLast(100);
                return this.setStepPoint(3); break;
            case 'pedal':
                this.animatePhotoOffset(0);
                this.animatePhotoCycled(0);
                this.animatePhotoCycledLast(0);
                this.handleEngagedMocked(false);
                this.setStepPoint(0);
                return this.setStep('OB_OUTRO'); break;
        }
    }

    animatePhotoOffset(offset) {
        const { photoOffset } = this.state;
        Animated.timing(
            photoOffset,
            {
                toValue: offset,
                duration: 1000,
            }
        ).start();
    }

    animatePhotoCycled(offset) {
        const { photoCycled } = this.state;
        Animated.timing(
            photoCycled,
            {
                toValue: offset,
                duration: 800,
            }
        ).start();
    }

    animatePhotoCycledLast(offset) {
        const { photoCycledLast } = this.state;
        Animated.timing(
            photoCycledLast,
            {
                toValue: offset,
                duration: 800,
            }
        ).start();
    }

    animateLeadEntered(offset) {
        const { leadEntered } = this.state;
        Animated.timing(
            leadEntered,
            {
                toValue: offset,
                duration: 500,
            }
        ).start();
    }

    animateTouchGateHighlighted(amount) {
        const { gateHighlighted } = this.state;
        Animated.sequence([
          Animated.timing(
            gateHighlighted,
            {
              toValue: amount,
              duration: 300,
            }
          ),
          Animated.timing(
              gateHighlighted,
              {
                  toValue: 0,
                  duration: 500,
              }
          )
        ]).start()
    }

    handleWrongGatePressed() {
        this.animateTouchGateHighlighted(50);
    }

    handleEngagedMocked(shouldMock) {
        this.setState({ engagedMocked: shouldMock })
        if (shouldMock) {
            ChffrPlus.sendBroadcast("ai.comma.plus.frame.ACTION_ENGAGED_MOCKED");
        } else {
            ChffrPlus.sendBroadcast("ai.comma.plus.frame.ACTION_ENGAGED_UNMOCKED");
        }
    }

    renderSplashStep() {
        return (
            <X.Entrance style={ Styles.onboardingSplashView }>
                <X.Text
                    size='jumbo' color='white' weight='bold'
                    style={ Styles.onboardingStepHeader }>
                    歡迎使用 openpilot alpha 版
                </X.Text>
                <X.Text
                    color='white' weight='light'
                    style={ Styles.onboardingStepContext }>
                    現在您已經完全設定好了，在您開始測試 openpilot alpha 版之前，請您務必先了解到它的功能和限制。
                </X.Text>
                <View style={ Styles.onboardingPrimaryAction }>
                    <X.Button
                        color='setupPrimary'
                        onPress={ () => this.setStep('OB_INTRO') }>
                        開始教學
                    </X.Button>
                </View>
            </X.Entrance>
        )
    }

    renderIntroStep() {
        const { stepChecks } = this.state;
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                <View style={ Styles.onboardingStepPoint }>
                    <View style={ Styles.onboardingStepPointChain }>
                        <X.Button
                            size='small' color='ghost'
                            style={ Styles.onboardingStepPointChainPrevious }
                            onPress={ () => this.setStep('OB_SPLASH') }>
                            <X.Image
                                source={ require('../../../img/icon_chevron_right.png') }
                                style={ Styles.onboardingStepPointChainPreviousIcon } />
                        </X.Button>
                        <View style={ Styles.onboardingStepPointChainNumber }>
                            <X.Text color='white' weight='semibold'>
                                1
                            </X.Text>
                        </View>
                    </View>
                    <View style={ Styles.onboardingStepPointBody }>
                        <X.Text size='bigger' color='white' weight='bold'>
                            openpilot 是進階版的駕駛輔助系統。
                        </X.Text>
                        <X.Text
                            size='smallish' color='white' weight='light'
                            style={ Styles.onboardingStepContextSmall }>
                            駕駛輔助系統不是自動駕駛系統。這代表 openpilot 的設計是來輔助您而不是取代您。駕駛時，您仍然需要注意行車安全。
                        </X.Text>
                        <X.CheckboxField
                            size='small'
                            color='white'
                            isChecked={ stepChecks.includes(1) }
                            onPress={ () => this.handleIntroCheckboxPressed(1) }
                            label='我仍會盯著路況。' />
                        <X.CheckboxField
                            size='small'
                            color='white'
                            isChecked={ stepChecks.includes(2) }
                            onPress={ () => this.handleIntroCheckboxPressed(2) }
                            label='我會準備好隨時接管控制。' />
                        <X.CheckboxField
                            size='small'
                            color='white'
                            isChecked={ stepChecks.includes(3) }
                            onPress={ () => this.handleIntroCheckboxPressed(3) }
                            label='我一定會準備好隨時接管控制!' />
                    </View>
                </View>
            </X.Entrance>
        )
    }

    renderSensorsStepPointIndex() {
        const { stepChecks } = this.state;
        return (
            <View style={ Styles.onboardingStepPoint }>
                <View style={ Styles.onboardingStepPointChain }>
                    <X.Button
                        size='small' color='ghost'
                        style={ Styles.onboardingStepPointChainPrevious }
                        onPress={ () => this.setStep('OB_INTRO') }>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointChainPreviousIcon } />
                    </X.Button>
                    <View style={ Styles.onboardingStepPointChainNumber }>
                        <X.Text color='white' weight='semibold'>
                            2
                        </X.Text>
                    </View>
                </View>
                <View style={ Styles.onboardingStepPointBody }>
                    <X.Text size='bigger' color='white' weight='bold'>
                        openpilot 使用多個傳感器來監看前方道路。
                    </X.Text>
                    <X.Text
                        size='smallish' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmall }>
                        在發送任何操控您車輛的訊號之前，我們用這些傳感器來構建前方道路場景。
                    </X.Text>
                    <X.RadioField
                        size='big'
                        color='white'
                        isChecked={ stepChecks.includes('camera') }
                        hasAppend={ true }
                        onPress={ () => this.handleSensorRadioPressed('camera') }
                        label='EON 的相機' />
                    <X.RadioField
                        size='big'
                        color='white'
                        isDisabled={ !stepChecks.includes('camera') }
                        isChecked={ stepChecks.includes('radar') }
                        hasAppend={ true }
                        onPress={ () => this.handleSensorRadioPressed('radar') }
                        label='來自您車上的雷達訊號' />
                </View>
            </View>
        )
    }

    renderSensorsStepPointCamera() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Button
                    size='small' color='ghost' textWeight='light'
                    style={ Styles.onboardingStepPointCrumb }
                    onPress={ () => this.handleSensorRadioPressed('index') }>
                    openpilot 的傳感器
                </X.Button>
                <X.Text size='medium' color='white' weight='bold'>
                    EON 的相機
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    我們利用後置相機補捉到的影像演算出行車的路徑。
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    車道分隔線會依據我們判斷的精準度標示不同的粗細。
                </X.Text>
                <X.Button color='ghost'
                    style={ Styles.onboardingStepPointInstruction }
                    onPress={ () => this.animateTouchGateHighlighted(100) }>
                    <X.Text
                        size='small' color='white' weight='semibold'
                        style={ Styles.onboardingStepPointInstructionText }>
                        請點選畫面上的行車路徑繼續
                    </X.Text>
                    <X.Image
                      source={ require('../../../img/icon_chevron_right.png') }
                      style={ Styles.onboardingStepPointInstructionIcon } />
                </X.Button>
            </X.Entrance>
        )
    }

    renderSensorsStepPointRadar() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Button
                    size='small' color='ghost' textWeight='light'
                    style={ Styles.onboardingStepPointCrumb }
                    onPress={ () => this.handleSensorRadioPressed('index') }>
                    openpilot 的傳感器
                </X.Button>
                <X.Text size='medium' color='white' weight='bold'>
                    來自您車上的雷達訊號
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    來自您車上的原廠雷達訊號幫助 openpilot 計算出與前車的距離，這將用來提供縱向控制的功能。
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    紅色或黃色的指標用來表示與前車之間的相對速度。
                </X.Text>
                <X.Button color='ghost'
                    style={ Styles.onboardingStepPointInstruction }
                    onPress={ () => this.handleWrongGatePressed() }>
                    <X.Text
                        size='small' color='white' weight='semibold'
                        style={ Styles.onboardingStepPointInstructionText }>
                        請點選畫面上的前車指標繼續
                    </X.Text>
                    <X.Image
                        source={ require('../../../img/icon_chevron_right.png') }
                        style={ Styles.onboardingStepPointInstructionIcon } />
                </X.Button>
            </X.Entrance>
        )
    }

    renderSensorsStepPoint() {
        const { stepPoint } = this.state;
        switch (stepPoint) {
            case 0:
                return this.renderSensorsStepPointIndex(); break;
            case 1:
                return this.renderSensorsStepPointCamera(); break;
            case 2:
                return this.renderSensorsStepPointRadar(); break;
        }
    }

    renderSensorsStep() {
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                { this.renderSensorsStepPoint() }
            </X.Entrance>
        )
    }

    renderControlsStepPointIndex() {
        const { stepChecks } = this.state;
        return (
            <View style={ Styles.onboardingStepPoint }>
                <View style={ Styles.onboardingStepPointChain }>
                    <X.Button
                        size='small' color='ghost'
                        style={ Styles.onboardingStepPointChainPrevious }
                        onPress={ () => this.setStep('OB_SENSORS') }>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointChainPreviousIcon } />
                    </X.Button>
                    <View style={ Styles.onboardingStepPointChainNumber }>
                        <X.Text color='white' weight='semibold'>
                            3
                        </X.Text>
                    </View>
                </View>
                <View style={ Styles.onboardingStepPointBody }>
                    <X.Text size='bigger' color='white' weight='bold'>
                        openpilot 將在巡航系統啟用後開始運作。
                    </X.Text>
                    <X.Text
                        size='smallish' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmall }>
                        按下巡航啟動，踩油門或剎車取消。
                    </X.Text>
                    <X.RadioField
                        size='medium'
                        color='white'
                        isChecked={ stepChecks.includes('cruise') }
                        hasAppend={ true }
                        onPress={ () => this.handleControlsRadioPressed('cruise') }
                        label='啟用 openpilot' />
                    <X.RadioField
                        size='medium'
                        color='white'
                        isDisabled={ !stepChecks.includes('cruise') }
                        isChecked={ stepChecks.includes('monitoring') }
                        hasAppend={ true }
                        onPress={ () => this.handleControlsRadioPressed('monitoring') }
                        label='駕駛監控' />
                    <X.RadioField
                        size='medium'
                        color='white'
                        isDisabled={ !stepChecks.includes('monitoring') }
                        isChecked={ stepChecks.includes('pedal') }
                        hasAppend={ true }
                        onPress={ () => this.handleControlsRadioPressed('pedal') }
                        label='取消 openpilot' />
                </View>
            </View>
        )
    }

    renderControlsStepPointEngage() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Button
                    size='small' color='ghost' textWeight='light'
                    style={ Styles.onboardingStepPointCrumb }
                    onPress={ () => this.handleControlsRadioPressed('index') }>
                    控制 openpilot
                </X.Button>
                <X.Text size='medium' color='white' weight='bold'>
                    啟用 openpilot
                </X.Text>
                <X.Text
                    size='small' color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    當您的車行駛在安全的速度時，您可以按下位於方向盤上的定速鈕 "SET" 開始使用 openpilot。
                </X.Text>
                <X.Button color='ghost'
                    style={ Styles.onboardingStepPointInstruction }
                    onPress={ () => this.handleWrongGatePressed() }>
                    <X.Text
                        size='small' color='white' weight='semibold'
                        style={ Styles.onboardingStepPointInstructionText }>
                        請點選畫面上的 "SET" 繼續
                    </X.Text>
                    <X.Image
                        source={ require('../../../img/icon_chevron_right.png') }
                        style={ Styles.onboardingStepPointInstructionIcon } />
                </X.Button>
            </X.Entrance>
        )
    }

    renderControlsStepPointMonitoring() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Entrance>
                    <X.Button
                        size='small' color='ghost' textWeight='light'
                        style={ Styles.onboardingStepPointCrumb }
                        onPress={ () => this.handleControlsRadioPressed('index') }>
                        控制 openpilot
                    </X.Button>
                    <X.Text size='medium' color='white' weight='bold'>
                        駕駛監控
                    </X.Text>
                    <X.Text
                        size='small' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmaller }>
                        當你使用 openpilot 時，請您務必隨時注意路況! openpilot 通過 3D 人臉/姿態識別來判斷駕駛的狀態。若是檢測到駕駛分心，openpilot 在警示完後取消。
                    </X.Text>
                    <X.Button color='ghost'
                        style={ Styles.onboardingStepPointInstruction }
                        onPress={ () => this.handleWrongGatePressed() }>
                        <X.Text
                            size='small' color='white' weight='semibold'
                            style={ Styles.onboardingStepPointInstructionText }>
                            請點選畫面上的人臉繼續
                        </X.Text>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointInstructionIcon } />
                    </X.Button>
                </X.Entrance>
            </X.Entrance>
        )
    }

    renderControlsStepPointDisengage() {
        return (
            <X.Entrance
                transition='fadeInLeft'
                duration={ 1000 }
                style={ Styles.onboardingStepPointSmall }>
                <X.Entrance>
                    <X.Button
                        size='small' color='ghost' textWeight='light'
                        style={ Styles.onboardingStepPointCrumb }
                        onPress={ () => this.handleControlsRadioPressed('index') }>
                        控制 openpilot
                    </X.Button>
                    <X.Text size='medium' color='white' weight='bold'>
                        取消 openpilot
                    </X.Text>
                    <X.Text
                        size='small' color='white' weight='light'
                        style={ Styles.onboardingStepContextSmaller }>
                        當您使用 openpilot 時，您可以隨時改以人工操控方向，縱向控制則會繼續由 openpilot 控制直到踩下油門或剎車取消 openpilot 為止。
                    </X.Text>
                    <X.Button color='ghost'
                        style={ Styles.onboardingStepPointInstruction }
                        onPress={ () => this.handleWrongGatePressed() }>
                        <X.Text
                            size='small' color='white' weight='semibold'
                            style={ Styles.onboardingStepPointInstructionText }>
                            請點選畫面上的油門或剎車繼續
                        </X.Text>
                        <X.Image
                            source={ require('../../../img/icon_chevron_right.png') }
                            style={ Styles.onboardingStepPointInstructionIcon } />
                    </X.Button>
                </X.Entrance>
            </X.Entrance>
        )
    }

    renderControlsStepPoint() {
        const { stepPoint } = this.state;
        switch (stepPoint) {
            case 0:
                return this.renderControlsStepPointIndex(); break;
            case 1:
                return this.renderControlsStepPointEngage(); break;
            case 2:
                return this.renderControlsStepPointMonitoring(); break;
            case 3:
                return this.renderControlsStepPointDisengage(); break;
        }
    }

    renderControlsStep() {
        return (
            <X.Entrance style={ Styles.onboardingStep }>
                { this.renderControlsStepPoint() }
            </X.Entrance>
        )
    }

    renderOutroStep() {
        return (
            <X.Entrance style={ Styles.onboardingOutroView }>
                <X.Text
                    size='jumbo' color='white' weight='bold'
                    style={ Styles.onboardingStepHeader }>
                    恭喜您! 您已經完成了 openpilot 的使用教學。
                </X.Text>
                <X.Text
                    color='white' weight='light'
                    style={ Styles.onboardingStepContextSmaller }>
                    若有需要，您可以隨時至 EON 設定裡重新閱讀使用指南。若您想知道更多關於 openpilot 的訊息，請參閱 wiki 或是加入我們位於 discord.comma.ai 的社群。
                </X.Text>
                <X.Line color='transparent' spacing='small' />
                <View style={ Styles.onboardingActionsRow }>
                    <View style={ Styles.onboardingPrimaryAction }>
                        <X.Button
                            color='setupPrimary'
                            onPress={ this.props.completeTrainingStep }>
                            完成教學
                        </X.Button>
                    </View>
                    <View style={ Styles.onboardingSecondaryAction }>
                        <X.Button
                            color='setupInverted'
                            textColor='white'
                            onPress={ this.handleRestartPressed }>
                            重新開始
                        </X.Button>
                    </View>
                </View>
            </X.Entrance>
        )
    }

    renderStep() {
        const { step } = this.state;
        switch (step) {
            case Step.OB_SPLASH:
                return this.renderSplashStep(); break;
            case Step.OB_INTRO:
                return this.renderIntroStep(); break;
            case Step.OB_SENSORS:
                return this.renderSensorsStep(); break;
            case Step.OB_CONTROLS:
                return this.renderControlsStep(); break;
            case Step.OB_OUTRO:
                return this.renderOutroStep(); break;
        }
    }

    render() {
        const {
            step,
            stepPoint,
            stepChecks,
            photoOffset,
            photoCycled,
            photoCycledLast,
            leadEntered,
            engagedMocked,
            gateHighlighted,
        } = this.state;

        const overlayStyle = [
            Styles.onboardingOverlay,
            stepPoint > 0 ? Styles.onboardingOverlayCollapsed : null,
        ];

        const gradientColor = engagedMocked ? 'engaged_green' : 'dark_blue';

        const Animations = {
            leadIndicatorDescended: {
                transform: [{
                    translateY: photoCycled.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, 40]
                    })
                }, {
                    translateX: photoCycled.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, -10]
                    })
                }, {
                    scaleX: photoCycled.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 1.5]
                    })
                }, {
                    scaleY: photoCycled.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 1.5]
                    })
                }]
            },
        };


        return (
            <View style={ Styles.onboardingContainer }>
                <Animated.Image
                    source={ require('../../../img/photo_baybridge_a_01.jpg') }
                    style={ [Styles.onboardingPhoto, {
                        transform: [{
                            translateX: photoOffset.interpolate({
                                inputRange: [0, 100],
                                outputRange: [0, -50]
                            })
                        }],
                    }] }>
                    <Animated.Image
                        source={ require('../../../img/illustration_training_lane_01.png') }
                        style={ [Styles.onboardingVisualLane, {
                            opacity: photoOffset.interpolate({
                                inputRange: [0, 100],
                                outputRange: [0, 1],
                            })
                        }] } />
                    <Animated.Image
                        source={ require('../../../img/illustration_training_lane_01.png') }
                        tintColor='lime'
                        pointerEvents='none'
                        style={ [Styles.onboardingVisualLane, {
                            opacity: gateHighlighted.interpolate({
                                inputRange: [0, 100],
                                outputRange: [0, 1],
                            })
                        }] }>
                        { stepPoint == 1 ? (
                            <X.Button
                                onPress={ () => { this.handleSensorVisualPressed('camera') } }
                                style={ [Styles.onboardingVisualLaneTouchGate] } />
                        ) : null }
                    </Animated.Image>

                    { (step === 'OB_SENSORS' && stepPoint > 1) ? (
                        <View style={ Styles.onboardingVisuals }>
                            <Animated.Image
                                source={ require('../../../img/photo_baybridge_b_01.jpg') }
                                style={ [Styles.onboardingPhotoCycled, {
                                    opacity: photoCycled.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: [0, 1],
                                    })
                                }] } />
                            <Animated.Image
                                source={ require('../../../img/illustration_training_lane_02.png') }
                                style={ [Styles.onboardingVisualLaneZoomed, {
                                    opacity: photoCycled.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: [0, 1],
                                    })
                                }] }>
                            </Animated.Image>
                            <Animated.Image
                                source={ require('../../../img/illustration_training_lead_01.png') }
                                style={ [Styles.onboardingVisualLead,
                                    Animations.leadIndicatorDescended ] } />
                            <Animated.Image
                                source={ require('../../../img/illustration_training_lead_02.png') }
                                style={ [Styles.onboardingVisualLead,
                                    Styles.onboardingVisualLeadZoomed,
                                    Animations.leadIndicatorDescended, {
                                    opacity: photoCycled.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: [0, 1]
                                    }),
                                }] } />
                            <Animated.View
                                style={ [Styles.onboardingVisualLeadTouchGate,
                                    Animations.leadIndicatorDescended, {
                                      opacity: gateHighlighted.interpolate({
                                          inputRange: [0, 100],
                                          outputRange: [0, 1],
                                      }),
                                    }] }>
                                <X.Button
                                    style={ Styles.onboardingVisualLeadTouchGateButton }
                                    onPress={ () => { this.handleSensorVisualPressed('radar') } } />
                            </Animated.View>
                        </View>
                    ) : null }

                    { step === 'OB_CONTROLS' ? (
                        <View style={ Styles.onboardingVisuals }>
                            <Animated.Image
                                source={ require('../../../img/photo_wheel_buttons_01.jpg') }
                                style={ [Styles.onboardingPhotoCruise] }>
                                { stepPoint == 1 ? (
                                    <Animated.View
                                      style={ [{
                                        opacity: gateHighlighted.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: [0, 1],
                                        }),
                                      }] }>
                                        <X.Button
                                            style={ Styles.onboardingVisualCruiseTouchGate }
                                            onPress={ () => { this.handleControlsVisualPressed('cruise') } } />
                                    </Animated.View>
                                ) : null }
                            </Animated.Image>
                            { stepPoint == 2 ? (
                                <Animated.Image
                                    source={ require('../../../img/photo_monitoring_01.jpg') }
                                    style={ [Styles.onboardingPhotoCycled, {
                                        opacity: photoCycled.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: [0, 1],
                                        }),
                                    }] }>
                                    <Animated.View style={ [Styles.onboardingFaceTouchGate, {
                                      opacity: gateHighlighted.interpolate({
                                          inputRange: [0, 100],
                                          outputRange: [0, 1],
                                      }),
                                    }]}>
                                        <X.Button
                                            style={ Styles.onboardingPedalTouchGateButton }
                                            onPress={ () => { this.handleControlsVisualPressed('monitoring') } } />
                                    </Animated.View>
                                </Animated.Image>
                            ) : null }
                            { stepPoint == 3 ? (
                                <View style={ Styles.onboardingVisuals }>
                                    <Animated.Image
                                        source={ require('../../../img/photo_monitoring_01.jpg') }
                                        style={ [Styles.onboardingPhotoCycled] } />
                                    <Animated.Image
                                        source={ require('../../../img/photo_pedals_01.jpg') }
                                        style={ [Styles.onboardingPhotoCycled, {
                                            opacity: photoCycledLast.interpolate({
                                                inputRange: [0, 100],
                                                outputRange: [0, 1],
                                            }),
                                        }] }>
                                        <Animated.View style={ [Styles.onboardingBrakePedalTouchGate, {
                                          opacity: gateHighlighted.interpolate({
                                              inputRange: [0, 100],
                                              outputRange: [0, 1],
                                          }),
                                        }]}>
                                            <X.Button
                                                style={ Styles.onboardingPedalTouchGateButton }
                                                onPress={ () => { this.handleControlsVisualPressed('pedal') } } />
                                        </Animated.View>
                                        <Animated.View style={ [Styles.onboardingGasPedalTouchGate, {
                                          opacity: gateHighlighted.interpolate({
                                              inputRange: [0, 100],
                                              outputRange: [0, 1],
                                          }),
                                        }] }>
                                            <X.Button
                                                style={ Styles.onboardingPedalTouchGateButton }
                                                onPress={ () => { this.handleControlsVisualPressed('pedal') } } />
                                        </Animated.View>
                                    </Animated.Image>
                                </View>
                            ) : null }
                        </View>
                    ) : null }

                    <Animated.View
                        style={ [...overlayStyle, {
                            transform: [{
                                translateX: photoOffset.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: [0, 50]
                                })
                            }],
                        }] }>
                        <X.Gradient
                            color={ gradientColor }>
                            { this.renderStep() }
                        </X.Gradient>
                    </Animated.View>
                </Animated.Image>
            </View>
        )
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
    completeTrainingStep: completeTrainingStep('Onboarding', dispatch),
    restartTraining: () => {
        onTrainingRouteCompleted('Onboarding');
    },
    onSidebarCollapsed: () => {
        ChffrPlus.sendBroadcast("ai.comma.plus.frame.ACTION_SIDEBAR_COLLAPSED");
    },
    onSidebarExpanded: () => {
        ChffrPlus.sendBroadcast("ai.comma.plus.frame.ACTION_SIDEBAR_EXPANDED");
    },
});
export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);
