import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Typography } from '../../src/components/Typography';
import { SPACING, PALETTE, RADIUS } from '../../src/constants/theme';
import { X, Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useStore } from '../../src/store/useStore';

const DEFAULT_WPM = 300;

export default function SpeedReaderScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { articles } = useStore();
    const article = articles.find(a => a.id === decodeURIComponent(id as string));

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [wpm, setWpm] = useState(DEFAULT_WPM);

    // Parse words and clean them
    const words = useMemo(() => {
        if (!article) return [];
        const text = (article.content || article.summary || '').replace(/<[^>]*>?/gm, ' ');
        return text.split(/\s+/).filter(w => w.length > 0);
    }, [article]);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isPlaying && currentIndex < words.length) {
            const msPerWord = (60 / wpm) * 1000;
            intervalRef.current = setInterval(() => {
                setCurrentIndex(prev => {
                    if (prev >= words.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, msPerWord);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, wpm, words.length, currentIndex]);

    if (!article) return null;

    const currentWord = words[currentIndex] || '';

    // Calculate Optimal Recognition Point (ORP)
    // Usually the center-left character
    const orpIndex = Math.max(0, Math.floor(currentWord.length / 2) - 1);
    const beforeOrp = currentWord.slice(0, orpIndex);
    const orpChar = currentWord[orpIndex] || '';
    const afterOrp = currentWord.slice(orpIndex + 1);

    return (
        <Screen safe={true} background={PALETTE.darkBackground}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <X stroke={PALETTE.textSecondary} size={28} />
                </TouchableOpacity>
                <Typography variant="bodyMedium" color={PALETTE.textTertiary}>
                    {Math.round((currentIndex / words.length) * 100)}% Complete
                </Typography>
            </View>

            <View style={styles.readerContainer}>
                {/* Alignment guides */}
                <View style={styles.guideContainer}>
                    <View style={styles.guideLine} />
                    <View style={[styles.guideLine, { top: undefined, bottom: 0 }]} />
                </View>

                <View style={styles.wordWrapper}>
                    <Typography variant="display" style={styles.wordBase}>
                        <Typography variant="display" color={PALETTE.textTertiary}>{beforeOrp}</Typography>
                        <Typography variant="display" color={PALETTE.accent}>{orpChar}</Typography>
                        <Typography variant="display" color={PALETTE.textPrimary}>{afterOrp}</Typography>
                    </Typography>
                </View>

                {/* Reticle Focus Point */}
                <View style={styles.reticle} />
            </View>

            <View style={styles.controls}>
                <View style={styles.wpmControl}>
                    <TouchableOpacity onPress={() => setWpm(Math.max(100, wpm - 50))}>
                        <ChevronLeft stroke={PALETTE.textSecondary} />
                    </TouchableOpacity>
                    <Typography variant="h2" style={{ width: 100, textAlign: 'center' }}>{wpm} WPM</Typography>
                    <TouchableOpacity onPress={() => setWpm(Math.min(1000, wpm + 50))}>
                        <ChevronRight stroke={PALETTE.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.mainActions}>
                    <TouchableOpacity onPress={() => setCurrentIndex(0)} style={styles.secondaryAction}>
                        <RotateCcw stroke={PALETTE.textSecondary} size={24} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setIsPlaying(!isPlaying)}
                        style={styles.playButton}
                    >
                        {isPlaying ? (
                            <Pause stroke="white" size={32} fill="white" />
                        ) : (
                            <Play stroke="white" size={32} fill="white" />
                        )}
                    </TouchableOpacity>

                    <View style={{ width: 44 }} /> {/* Spacer */}
                </View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: SPACING.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeButton: {
        padding: 4,
    },
    readerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#050505',
        marginHorizontal: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: PALETTE.border,
        paddingHorizontal: 20,
        overflow: 'hidden',
    },
    guideContainer: {
        position: 'absolute',
        width: '100%',
        height: 120,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    guideLine: {
        width: 40,
        height: 2,
        backgroundColor: PALETTE.borderHilight,
        position: 'absolute',
        top: 0,
    },
    reticle: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 2,
        height: 40,
        backgroundColor: 'rgba(94, 106, 210, 0.3)',
        transform: [{ translateX: -1 }, { translateY: -20 }],
    },
    wordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wordBase: {
        fontSize: 48,
        fontFamily: 'Inter_700Bold', // Uniform width works better for RSVP
        letterSpacing: -1,
    },
    controls: {
        padding: SPACING.xl,
        paddingBottom: 60,
    },
    wpmControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    mainActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: PALETTE.accent,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: PALETTE.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    secondaryAction: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: PALETTE.elementBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: PALETTE.border,
    }
});
