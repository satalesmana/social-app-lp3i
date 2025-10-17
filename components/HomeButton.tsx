import { Octicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

interface HomeButtonProps {
  onPress: () => void;
  iconName: keyof typeof Octicons.glyphMap;
  label: string;
}

const HomeButton: React.FC<HomeButtonProps> = ({
  onPress,
  iconName,
  label,
}) => {
  return (
    <Pressable
      className="text-lg mb-6 flex flex-row items-center gap-5 group "
      onPress={onPress}
    >
      <Text className="group-hover:text-blue-500 transition duration-300 ease-in-out">
        <Octicons name={iconName} size={22} color="black" />
      </Text>
      <Text className="text-lg group-hover:text-blue-500">{label}</Text>
    </Pressable>
  );
};

export default HomeButton;
