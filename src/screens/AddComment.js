import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const AddComment = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>أضف تعليقك</Text>
      <TextInput
        style={styles.input}
        placeholder="اكتب تعليقك هنا..."
        multiline
      />
      <Button title="إرسال" onPress={() => alert('تم إرسال تعليقك!')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 8,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
});

export default AddComment;
