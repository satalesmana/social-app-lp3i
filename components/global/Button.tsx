import {TouchableOpacity, Text, StyleSheet} from "react-native";
import { Ionicons } from '@expo/vector-icons';


interface FloatingButtonProps {
  iconName?: string;
  onPress: () => void;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress, iconName='add' }) => {
    return (
        <TouchableOpacity
          onPress={onPress}
          style={styles.btnStyle}
        >
          <Ionicons name={iconName} size={32} color="#fff" />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    btnStyle:{ 
        bottom: 10,
        position: "absolute", 
        right: 24,
        backgroundColor: "#1DA1F2", 
        borderRadius: 50, 
        width: 60, 
        height: 60, 
        zIndex: 10,
        justifyContent: "center", 
        alignItems: "center", 
        shadowColor: "#000", 
        shadowOpacity: 0.3, 
        shadowOffset: { width: 0, height: 3 }, 
        shadowRadius: 5, elevation: 8, 
    }
})