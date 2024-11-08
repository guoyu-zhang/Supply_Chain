import useKafkaStream from "../hooks/use-kafka-stream";

export default function RealTimePurchases({ }) {
  const messages = useKafkaStream();

  return (
    <div>
      <h2>Real-Time Product Purchases</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>
            <strong>Message:</strong> {message.message} <br />
            <strong>Timestamp:</strong> {message.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

