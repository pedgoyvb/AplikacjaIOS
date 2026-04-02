import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

type Post = {
  id: number;
  title: string;
  body: string;
};

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10');

        if (!response.ok) {
          throw new Error(`Błąd HTTP: ${response.status}`);
        }

        const json = await response.json();
        setPosts(json);
      } catch (e: any) {
        setError(e.message || 'Wystąpił błąd podczas pobierania danych');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleAddPost = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Błąd', 'Uzupełnij tytuł i treść.');
      return;
    }

    try {
      setSending(true);

      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          userId: 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }

      const json = await response.json();

      const newPost: Post = {
        id: json.id ?? Date.now(),
        title: json.title,
        body: json.body,
      };

      setPosts((prev) => [newPost, ...prev]);
      setTitle('');
      setBody('');

      Alert.alert('Sukces', 'Dane zostały wysłane na serwer.');
    } catch (e: any) {
      Alert.alert('Błąd', e.message || 'Nie udało się wysłać danych.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.info}>Ładowanie danych...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>Błąd: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Połączenie z serwerem</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tytuł posta"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Treść posta"
          value={body}
          onChangeText={setBody}
          multiline
        />

        <TouchableOpacity
          style={[styles.button, sending && styles.buttonDisabled]}
          onPress={handleAddPost}
          disabled={sending}
        >
          <Text style={styles.buttonText}>
            {sending ? 'Wysyłanie...' : 'Wyślij dane'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postBody}>{item.body}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  info: {
    marginTop: 12,
    fontSize: 16,
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  form: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  postBody: {
    fontSize: 14,
    color: '#444',
  },
});