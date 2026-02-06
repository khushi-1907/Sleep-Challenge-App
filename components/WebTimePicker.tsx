import React, { useEffect, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface WebTimePickerProps {
    value: Date;
    onChange: (time: string) => void;
    onClose: () => void;
    visible: boolean;
}

export const WebTimePicker: React.FC<WebTimePickerProps> = ({ value, onChange, onClose, visible }) => {
    const [hours, setHours] = useState(value.getHours().toString().padStart(2, '0'));
    const [minutes, setMinutes] = useState(value.getMinutes().toString().padStart(2, '0'));

    // Update state when value prop changes (e.g., when switching between sleep and wake time)
    useEffect(() => {
        setHours(value.getHours().toString().padStart(2, '0'));
        setMinutes(value.getMinutes().toString().padStart(2, '0'));
    }, [value]);

    const handleConfirm = () => {
        onChange(`${hours}:${minutes}`);
        onClose();
    };

    const incrementHours = () => {
        const h = parseInt(hours);
        setHours(((h + 1) % 24).toString().padStart(2, '0'));
    };

    const decrementHours = () => {
        const h = parseInt(hours);
        setHours(((h - 1 + 24) % 24).toString().padStart(2, '0'));
    };

    const incrementMinutes = () => {
        const m = parseInt(minutes);
        setMinutes(((m + 15) % 60).toString().padStart(2, '0'));
    };

    const decrementMinutes = () => {
        const m = parseInt(minutes);
        setMinutes(((m - 15 + 60) % 60).toString().padStart(2, '0'));
    };

    if (Platform.OS !== 'web') {
        return null;
    }

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.pickerContainer}>
                    <Text style={styles.title}>Select Time</Text>
                    <View style={styles.timeContainer}>
                        <View style={styles.timeColumn}>
                            <TouchableOpacity onPress={incrementHours} style={styles.button}><Text style={styles.buttonText}>▲</Text></TouchableOpacity>
                            <TextInput
                                style={styles.timeInput}
                                value={hours}
                                onChangeText={(text) => {
                                    const h = parseInt(text) || 0;
                                    if (h >= 0 && h <= 23) {
                                        setHours(h.toString().padStart(2, '0'));
                                    }
                                }}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <TouchableOpacity onPress={decrementHours} style={styles.button}><Text style={styles.buttonText}>▼</Text></TouchableOpacity>
                        </View>
                        <Text style={styles.colon}>:</Text>
                        <View style={styles.timeColumn}>
                            <TouchableOpacity onPress={incrementMinutes} style={styles.button}><Text style={styles.buttonText}>▲</Text></TouchableOpacity>
                            <TextInput
                                style={styles.timeInput}
                                value={minutes}
                                onChangeText={(text) => {
                                    const m = parseInt(text) || 0;
                                    if (m >= 0 && m <= 59) {
                                        setMinutes(m.toString().padStart(2, '0'));
                                    }
                                }}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <TouchableOpacity onPress={decrementMinutes} style={styles.button}><Text style={styles.buttonText}>▼</Text></TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={onClose} style={[styles.actionButton, styles.cancelButton]}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity onPress={handleConfirm} style={[styles.actionButton, styles.confirmButton]}><Text style={styles.confirmButtonText}>Confirm</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: 280,
        boxShadow: '0px 4px 8px rgba(0,0,0,0.25)',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#1f2937',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    timeColumn: {
        alignItems: 'center',
    },
    timeInput: {
        width: 60,
        height: 40,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 8,
    },
    button: {
        padding: 4,
    },
    buttonText: {
        fontSize: 16,
        color: '#6b7280',
    },
    colon: {
        fontSize: 20,
        fontWeight: 'bold',
        marginHorizontal: 8,
        color: '#374151',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
    },
    cancelButtonText: {
        textAlign: 'center',
        color: '#6b7280',
        fontWeight: '600',
    },
    confirmButton: {
        backgroundColor: '#3b82f6',
    },
    confirmButtonText: {
        textAlign: 'center',
        color: 'white',
        fontWeight: '600',
    },
});
