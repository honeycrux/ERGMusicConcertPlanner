export function SystemMessage({ message, type }: { message: string; type: "success" | "error" | "info" }) {
  let className: string;
  switch (type) {
    case "success":
      className = "text-green-500";
      break;
    case "error":
      className = "text-red-500";
      break;
    default:
      className = "";
      break;
  }
  const currentDate = new Date();
  const currentHour = currentDate.getHours().toString().padStart(2, "0");
  const currentMinute = currentDate.getMinutes().toString().padStart(2, "0");
  const currentSecond = currentDate.getSeconds().toString().padStart(2, "0");
  const currentTime = `${currentHour}:${currentMinute}:${currentSecond}`;
  return (
    <div className={className}>
      {currentTime} -- {message}
    </div>
  );
}
