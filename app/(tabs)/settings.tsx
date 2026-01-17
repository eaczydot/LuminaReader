import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { Typography } from '../../src/components/Typography';
import { SPACING, PALETTE, RADIUS } from '../../src/constants/theme';
import { useStore } from '../../src/store/useStore';
import { Globe, Zap, Send, CheckCircle2 } from 'lucide-react-native';

export default function SettingsScreen() {
    const { webhookUrl, setWebhookUrl } = useStore();
    const [url, setUrl] = useState(webhookUrl);
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setWebhookUrl(url);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <Screen style={styles.container}>
            <View style={styles.header}>
                <Typography variant="h1">Settings</Typography>
                <Typography variant="body" color={PALETTE.textSecondary}>
                    Configure your Lumina experience.
                </Typography>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Zap size={20} color={PALETTE.accent} />
                        <Typography variant="bodyBold" style={{ marginLeft: 8 }}>Integrations</Typography>
                    </View>

                    <Typography variant="caption" color={PALETTE.textSecondary} style={styles.description}>
                        Connect Lumina to Pipedream, Zapier, or Make.md via webhooks for real-time sync.
                    </Typography>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="https://your-webhook.com/..."
                            placeholderTextColor={PALETTE.textTertiary}
                            value={url}
                            onChangeText={setUrl}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                            {saved ? <CheckCircle2 size={20} color="white" /> : <Send size={20} color="white" />}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Globe size={20} color={PALETTE.textTertiary} />
                        <Typography variant="bodyBold" style={{ marginLeft: 8 }}>Sync Platforms</Typography>
                    </View>
                    <Typography variant="body" color={PALETTE.textSecondary} style={{ marginTop: 8 }}>
                        • Pipedream (Real-time events){'\n'}
                        • Make.md (Markdown export){'\n'}
                        • Obsidian (Local sync support)
                    </Typography>
                </View>
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.lg,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: PALETTE.elementBackground,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: PALETTE.border,
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    description: {
        marginBottom: SPACING.md,
    },
    inputContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    input: {
        flex: 1,
        backgroundColor: PALETTE.subtleBackground,
        borderWidth: 1,
        borderColor: PALETTE.border,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        color: PALETTE.textPrimary,
        fontFamily: 'Inter_400Regular',
    },
    saveButton: {
        backgroundColor: PALETTE.accent,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: RADIUS.md,
    }
});
