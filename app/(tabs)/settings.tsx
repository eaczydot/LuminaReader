import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Typography } from '../../src/components/Typography';
import { colors, spacing, radius, textStyles, typography } from '../../src/theme/tokens';
import { useStore } from '../../src/store/useStore';
import { Globe, Zap, Send, CheckCircle2, Moon, Sun, Monitor, Type, AlignLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
    const { settings, updateSettings, webhookUrl, setWebhookUrl } = useStore();
    const [url, setUrl] = useState(webhookUrl);
    const [saved, setSaved] = useState(false);

    const handleSaveWebhook = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setWebhookUrl(url);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleUpdateSetting = (updates: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        updateSettings(updates);
    };

    const SettingOption = ({ label, icon: Icon, active, onPress }: any) => (
        <TouchableOpacity
            style={[styles.option, active && styles.optionActive]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {Icon && <Icon size={14} color={active ? colors.accent : colors.text3} />}
            <Typography
                variant="labelSmall"
                style={[styles.optionLabel, active && styles.optionLabelActive]}
            >
                {label}
            </Typography>
        </TouchableOpacity>
    );

    return (
        <Screen style={styles.container}>
            <View style={styles.header}>
                <Typography variant="displayMedium">Settings</Typography>
                <Typography variant="bodySmall" color={colors.text3}>
                    Customize your experience & sync.
                </Typography>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                {/* Appearance Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Monitor size={16} color={colors.text3} />
                        <Typography variant="labelSmall" style={styles.sectionTitle}>APPEARANCE</Typography>
                    </View>
                    <View style={styles.optionsGrid}>
                        <SettingOption
                            label="Light"
                            icon={Sun}
                            active={settings.theme === 'light'}
                            onPress={() => handleUpdateSetting({ theme: 'light' })}
                        />
                        <SettingOption
                            label="Dark"
                            icon={Moon}
                            active={settings.theme === 'dark'}
                            onPress={() => handleUpdateSetting({ theme: 'dark' })}
                        />
                        <SettingOption
                            label="System"
                            icon={Monitor}
                            active={settings.theme === 'system'}
                            onPress={() => handleUpdateSetting({ theme: 'system' })}
                        />
                    </View>
                </View>

                {/* Typography Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Type size={16} color={colors.text3} />
                        <Typography variant="labelSmall" style={styles.sectionTitle}>TYPOGRAPHY</Typography>
                    </View>

                    <Typography variant="labelSmall" color={colors.text3} style={styles.subLabel}>FONT SIZE</Typography>
                    <View style={styles.optionsGrid}>
                        <SettingOption
                            label="Small"
                            active={settings.fontSize === 'small'}
                            onPress={() => handleUpdateSetting({ fontSize: 'small' })}
                        />
                        <SettingOption
                            label="Medium"
                            active={settings.fontSize === 'medium'}
                            onPress={() => handleUpdateSetting({ fontSize: 'medium' })}
                        />
                        <SettingOption
                            label="Large"
                            active={settings.fontSize === 'large'}
                            onPress={() => handleUpdateSetting({ fontSize: 'large' })}
                        />
                    </View>

                    <Typography variant="labelSmall" color={colors.text3} style={[styles.subLabel, { marginTop: spacing[3] }]}>FONT FAMILY</Typography>
                    <View style={styles.optionsGrid}>
                        <SettingOption
                            label="Newsreader"
                            active={settings.fontFamily === 'newsreader'}
                            onPress={() => handleUpdateSetting({ fontFamily: 'newsreader' })}
                        />
                        <SettingOption
                            label="System Sans"
                            active={settings.fontFamily === 'system'}
                            onPress={() => handleUpdateSetting({ fontFamily: 'system' })}
                        />
                    </View>
                </View>

                {/* Integrations Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Zap size={16} color={colors.accent} />
                        <Typography variant="labelSmall" style={styles.sectionTitle}>SYNC WEBHOOK</Typography>
                    </View>

                    <Typography variant="bodySmall" color={colors.text3} style={styles.description}>
                        Connect to Pipedream or Make.md via webhooks.
                    </Typography>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="https://your-webhook.com/..."
                            placeholderTextColor={colors.text3}
                            value={url}
                            onChangeText={setUrl}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={handleSaveWebhook} style={styles.saveButton}>
                            {saved ? <CheckCircle2 size={18} color="white" /> : <Send size={18} color="white" />}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Typography variant="labelSmall" color={colors.text3}>Lumina Reader v1.0.0</Typography>
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        paddingTop: spacing[6],
        paddingHorizontal: spacing[4],
        marginBottom: spacing[6],
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing[4],
        paddingBottom: spacing[10],
    },
    section: {
        marginBottom: spacing[6],
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[3],
    },
    sectionTitle: {
        letterSpacing: 1.5,
        color: colors.text3,
    },
    subLabel: {
        marginBottom: spacing[1.5],
        marginLeft: spacing[1],
        fontSize: 10,
    },
    optionsGrid: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing[1],
        borderWidth: 1,
        borderColor: colors.border,
        gap: spacing[1],
    },
    option: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[1.5],
        paddingVertical: spacing[1.5],
        borderRadius: radius.sm,
    },
    optionActive: {
        backgroundColor: colors.chipBg,
        borderWidth: 1,
        borderColor: colors.chipBorder,
    },
    optionLabel: {
        color: colors.text3,
        fontSize: 11,
    },
    optionLabelActive: {
        color: colors.accent,
    },
    description: {
        marginBottom: spacing[3],
        marginLeft: spacing[1],
    },
    inputContainer: {
        flexDirection: 'row',
        gap: spacing[2],
    },
    input: {
        flex: 1,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing[2.5],
        color: colors.text,
        fontFamily: typography.fonts.sans,
        fontSize: 13,
    },
    saveButton: {
        backgroundColor: colors.accent,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: radius.md,
    },
    footer: {
        marginTop: spacing[4],
        alignItems: 'center',
        paddingBottom: spacing[10],
    },
});
