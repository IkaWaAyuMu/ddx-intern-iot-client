import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Auth, Hub } from 'aws-amplify';
import { useEffect, useState } from 'react';
import { Pressable, View, Text, Modal } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default function User() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [customState, setCustomState] = useState<string | null>(null);

  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          Auth.currentAuthenticatedUser()
          .then((currentUser) => setUser(currentUser))
          .catch((e) => console.log(e))
          break;
        case "signOut":
          setUser(null);
          break;
        case "customOAuthState":
          setCustomState(data);
          break;
      }
    });

    Auth.currentAuthenticatedUser()
      .then((currentUser) => setUser(currentUser))
      .catch((e) => console.log(e))
      .finally(() => setIsLoading(false));

    return unsubscribe;
  }, []);

  return (
    <>
      <Pressable onPress={() => setShowModal(!showModal)} style={styles.userButton}>
        <FontAwesome name='user' size={16} color='#ffffff'/> 
      </Pressable>
      {showModal && <Modal transparent={true} visible={showModal} onRequestClose={() => setShowModal(false)} animationType="fade">
        <Pressable onPress={() => setShowModal(false)} style={styles.screen} />
        {!isLoading && <View style={styles.userModal}>
          {user && <Text style={styles.userModalText}>{user.attributes.name}</Text>}
          {!user && <Pressable onPress={() => Auth.federatedSignIn()} style={styles.actionButton}><Text style={styles.actionButtonText}>Sign In</Text></Pressable>}
          {user && <Pressable onPress={() => Auth.signOut()} style={styles.actionButton}><Text style={styles.actionButtonText}>Sign Out</Text></Pressable>}
        </View>}
      </Modal>}
    </>
  )
}

const styles = EStyleSheet.create({
  userButton: {
    position: 'absolute',
    overflow: 'hidden',
    top: 10,
    right: 10,
    borderRadius: '$infinity',
    width: '2.25rem',
    height: '2.25rem',
    backgroundColor: '$gray600',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userModal: {
    position: 'absolute',
    overflow: 'hidden',
    top: 50,
    right: 10,
    borderRadius: 5,
    width: '12.5rem',
    height: '4.6875rem',
    backgroundColor: '$gray600',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
  },
  userModalText: {
    color: '$white',
  },
  actionButton: {
    height: '1.75rem',
    borderRadius: 5,
    paddingHorizontal: '0.5rem',
    backgroundColor: '$black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '$white',
  },
  screen: {
    ...EStyleSheet.absoluteFillObject,
    backgroundColor: "$black_20",
  }
});