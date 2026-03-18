import { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";

export default function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("https://swipers.onrender.com/api/message")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error(err);
        setMessage("Error connecting to backend ❌");
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000", 
  },
  text: {
    fontSize: 20,
    color: "#fff",
  },
});