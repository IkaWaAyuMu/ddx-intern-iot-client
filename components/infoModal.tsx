import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { Modal, Pressable, Text, View, Image, ImageSourcePropType, ScrollView } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";

export default function InfoModal(props: {
  info: { topic: string; image?: ImageSourcePropType; short: string; long: string };
  isOpen: boolean;
  closeCallback: () => void;
}) {
  const { info, isOpen, closeCallback } = props;

  const [isLargeModalOpen, setIsLargeModalOpen] = useState<boolean>(false);

  return (
    <>
      <Modal transparent={true} visible={isOpen} onRequestClose={closeCallback} animationType="fade">
        <Pressable style={styles.screen} onPress={closeCallback}></Pressable>
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            {info.image && <Image style={styles.imageContainer} source={info.image}/>}
            <View style={styles.textContainer}>
              <Text style={{ ...styles.modalText, ...styles.modalHeaderText }}>{info.topic}</Text>
              <Text style={{ ...styles.modalText, ...styles.modalDescriptionText }}>{info.short}</Text>
              <Pressable onPress={() => setIsLargeModalOpen(true)}><Text style={{ ...styles.modalText, ...styles.seeMoreText }}>See more -{">"}</Text></Pressable>
            </View>
            <Pressable style={styles.closeButton} onPress={closeCallback}><Feather name="x" size={24} color="#fff"/></Pressable>
          </View>
        </View>
      </Modal>
      <Modal transparent={true} visible={isLargeModalOpen} onRequestClose={() => setIsLargeModalOpen(false)} animationType="slide">
        <View style={styles.largeModalContainer}>
            {info.image && <Image style={styles.imageContainer} source={info.image}/>}
            <ScrollView contentContainerStyle={styles.textContainer}>
              <Text style={{ ...styles.modalText, ...styles.modalHeaderText }}>{info.topic}</Text>
              <Text style={{ ...styles.modalText, ...styles.modalDescriptionText }}>{info.long}</Text>
            </ScrollView>
            <Pressable style={styles.closeButton} onPress={() => setIsLargeModalOpen(false)}><Feather name="x" size={24} color="#fff"/></Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = EStyleSheet.create({
  modalContainer: {
    ...EStyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    overflow: "hidden",
    borderRadius: "0.75rem",
    marginHorizontal: "1rem",
    backgroundColor: "$gray800",
  },
  imageContainer: {
    height: "8.25rem"
  },
  textContainer: {
    padding: "1rem",
    gap: "0.25rem",
  },
  modalText: {
    color: "$white",
  },
  modalHeaderText:{
    fontFamily: "UberMove-Bold",
    fontSize: "1.25rem",
  },
  modalDescriptionText: {
    fontFamily: "UberMoveText-Light",
    fontSize: "0.875rem",
  },
  seeMoreText: {
    fontFamily: "UberMoveText-Medium",
    fontSize: "0.875rem",
    marginTop: "0.5rem",
  },
  closeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    borderRadius: "$infinity",
    backgroundColor: "$black_20",
  },
  screen: {
    ...EStyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: "$black_overlay",
  },
  largeModalContainer: {
    ...EStyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: "$gray800",
  }
});
