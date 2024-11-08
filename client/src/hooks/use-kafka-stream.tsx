import { useEffect, useState } from "react";

// Define the type for a message (you may need to adjust this based on your Kafka data)
interface KafkaMessage {
  message: string;
  timestamp: string;
}

const useKafkaStream = (): KafkaMessage[] => {
  const [messages, setMessages] = useState<KafkaMessage[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:3001/stream");

    eventSource.onmessage = (event) => {
      const newMessage: KafkaMessage = JSON.parse(event.data); // Cast to KafkaMessage type
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    // Cleanup function to close the EventSource connection when the component unmounts
    return () => {
      eventSource.close();
    };
  }, []);

  return messages;
};

export default useKafkaStream;
