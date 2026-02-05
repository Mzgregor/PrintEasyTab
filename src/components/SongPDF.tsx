import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Song, Measure } from '../types';

// Register a nice font if possible, otherwise use standard fonts
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
        color: '#000000',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 4,
    },
    artist: {
        fontSize: 14,
        fontFamily: 'Helvetica-Oblique',
        color: '#444444',
    },
    section: {
        marginBottom: 10,
        // Avoid page break inside section if possible?
        // break: false, but sections can be long.
    },
    sectionLabel: {
        fontSize: 12,
        marginTop: 10,
        marginBottom: 4,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        alignSelf: 'flex-start',
        borderRadius: 2,
    },
    measureGrid: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderTop: '1px solid #000000',
        borderLeft: '1px solid #000000',
    },
    measure: {
        width: '25%', // 4 per row
        height: 40,
        borderRight: '1px solid #000000',
        borderBottom: '1px solid #000000',
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    chord: {
        fontSize: 14,
        // space them out based on duration? 
        // Simply distribute roughly evenly for now
    },
    chordText: {
        fontFamily: 'Helvetica-Bold',
        marginHorizontal: 4,
    }
});

const MeasureView = ({ measure }: { measure: Measure }) => {
    return (
        <View style={styles.measure}>
            {measure.chords.length === 0 ? (
                <Text style={{ ...styles.chordText, color: '#CCCCCC' }}>%</Text>
            ) : (
                measure.chords.map((chord, i) => (
                    <Text key={i} style={styles.chordText}>
                        {chord.text}
                    </Text>
                ))
            )}
        </View>
    );
};

export const SongPDF: React.FC<{ songs: Song[] }> = ({ songs }) => {
    return (
        <Document title="Chord Sheet">
            <Page size="A4" style={styles.page}>
                {songs.map((song, index) => (
                    <View key={song.id} style={{ marginBottom: 20 }}>
                        {/* Song Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>{song.title || `Song ${index + 1}`}</Text>
                            <Text style={styles.artist}>{song.artist || 'Unknown Artist'}</Text>
                            {song.capo > 0 && (
                                <View style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: '#000000',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'Helvetica-Bold' }}>
                                        {song.capo}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Song Sections */}
                        {song.sections.map((section) => (
                            <View key={section.id} style={styles.section} wrap={false}>
                                <Text style={styles.sectionLabel}>{section.label}</Text>
                                <View style={styles.measureGrid}>
                                    {section.measures.map((measure) => (
                                        <MeasureView key={measure.id} measure={measure} />
                                    ))}
                                </View>
                            </View>
                        ))}

                        {/* Divider if not last song */}
                        {index < songs.length - 1 && (
                            <View style={{
                                marginVertical: 15,
                                borderBottomWidth: 2,
                                borderBottomColor: '#EEEEEE',
                                borderStyle: 'dashed'
                            }} />
                        )}
                    </View>
                ))}

                <Text style={{ position: 'absolute', bottom: 30, right: 30, fontSize: 10, color: '#999999' }} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};
