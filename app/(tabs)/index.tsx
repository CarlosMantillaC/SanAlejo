import { useFocusEffect, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import {
  Contenedor,
  deleteContenedor,
  getContenedores,
  initDatabase,
} from "@/lib/san-alejo-db";

const palette = Colors.light;

export default function ContenedoresScreen() {
  const router = useRouter();
  const [contenedores, setContenedores] = useState<Contenedor[]>([]);

  async function loadContenedores() {
    await initDatabase();
    const rows = await getContenedores();
    setContenedores(rows);
  }

  useFocusEffect(() => {
    loadContenedores();
  });

  const onDeleteContenedor = (id: number) => {
    Alert.alert(
      "Eliminar contenedor",
      "¿Seguro que deseas eliminar este contenedor? También se eliminarán sus objetos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            await deleteContenedor(id);
            await loadContenedores();
          },
        },
      ],
    );
  };

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        San Alejo
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Inventario de objetos guardados
      </ThemedText>

      {contenedores.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText>
            No hay contenedores. Agrega tu primera caja, maleta o cajón.
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={contenedores}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/contenedor/${item.id}`)}
            >
              <ThemedText type="defaultSemiBold">{item.nombre}</ThemedText>
              <ThemedText>{item.descripcion}</ThemedText>
              <ThemedText>📍 {item.ubicacion}</ThemedText>

              <ThemedView style={styles.actionsRow}>
                <Pressable
                  style={[styles.secondaryButton, styles.actionButton]}
                  onPress={() => router.push(`/contenedor-form?id=${item.id}`)}
                >
                  <ThemedText type="defaultSemiBold">Editar</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.secondaryButton, styles.actionButton]}
                  onPress={() => onDeleteContenedor(item.id)}
                >
                  <ThemedText type="defaultSemiBold">Eliminar</ThemedText>
                </Pressable>
              </ThemedView>
            </Pressable>
          )}
        />
      )}

      <Pressable
        style={styles.primaryButton}
        onPress={() => router.push("/contenedor-form")}
      >
        <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
          + Agregar contenedor
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
    gap: 8,
  },
  title: {
    marginTop: 8,
  },
  subtitle: {
    marginBottom: 8,
  },
  emptyContainer: {
    borderWidth: 1,
    borderColor: palette.icon,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  listContent: {
    gap: 10,
    paddingBottom: 96,
  },
  card: {
    borderWidth: 1,
    borderColor: palette.icon,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: palette.icon,
  },
  primaryButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: palette.tint,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: palette.background,
  },
});
