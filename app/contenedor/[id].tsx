import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import {
  Objeto,
  deleteObjeto,
  getContenedorById,
  getObjetosByContenedorId,
  type Contenedor,
} from "@/lib/san-alejo-db";

const palette = Colors.light;

export default function ContenedorDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();

  const contenedorId = Number(params.id);

  const [contenedor, setContenedor] = useState<Contenedor | null>(null);
  const [objetos, setObjetos] = useState<Objeto[]>([]);


  async function loadData() {
    if (!Number.isFinite(contenedorId)) {
      return;
    }

    const [contenedorResult, objetosResult] = await Promise.all([
      getContenedorById(contenedorId),
      getObjetosByContenedorId(contenedorId),
    ]);

    setContenedor(contenedorResult ?? null);
    setObjetos(objetosResult);
  }

  useFocusEffect(() => {
    loadData();
  });

  const onDeleteObjeto = (objetoId: number) => {
    Alert.alert("Eliminar objeto", "¿Seguro que deseas eliminar este objeto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteObjeto(objetoId);
          await loadData();
        },
      },
    ]);
  };

  if (!Number.isFinite(contenedorId)) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>ID de contenedor inválido.</ThemedText>
      </ThemedView>
    );
  }

  if (!contenedor) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>Cargando contenedor...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title" style={styles.title}>
        {contenedor.nombre}
      </ThemedText>
      <ThemedText>{contenedor.descripcion}</ThemedText>
      <ThemedText>📍 {contenedor.ubicacion}</ThemedText>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Objetos
      </ThemedText>

      {objetos.length === 0 ? (
        <ThemedView style={[styles.emptyContainer, styles.borderTheme]}>
          <ThemedText>
            Este contenedor está vacío. Agrega los objetos que hay dentro.
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={objetos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ThemedView style={[styles.card, styles.borderTheme]}>
              <ThemedText type="defaultSemiBold">{item.nombre}</ThemedText>
              <ThemedText>{item.descripcion}</ThemedText>

              <ThemedView style={styles.actionsRow}>
                <Pressable
                  style={[
                    styles.secondaryButton,
                    styles.actionButton,
                    styles.borderTheme,
                  ]}
                  onPress={() =>
                    router.push(
                      `/objeto-form?contenedorId=${contenedorId}&objetoId=${item.id}`,
                    )
                  }
                >
                  <ThemedText type="defaultSemiBold">Editar</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.actionDeleteTheme]}
                  onPress={() => onDeleteObjeto(item.id)}
                >
                  <ThemedText type="defaultSemiBold">Eliminar</ThemedText>
                </Pressable>
              </ThemedView>
            </ThemedView>
          )}
        />
      )}

      <Pressable
        style={[styles.primaryButton, styles.addButtonTheme]}
        onPress={() => router.push(`/objeto-form?contenedorId=${contenedorId}`)}
      >
        <ThemedText
          type="defaultSemiBold"
          style={[styles.primaryButtonText, styles.addButtonTextTheme]}
        >
          + Agregar objeto
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 6,
  },
  title: {
    marginTop: 8,
  },
  sectionTitle: {
    marginTop: 12,
  },
  emptyContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  listContent: {
    gap: 10,
    paddingVertical: 8,
    paddingBottom: 96,
  },
  card: {
    borderWidth: 1,
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
  },
  primaryButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    lineHeight: 20,
  },
  borderTheme: {
    borderColor: palette.icon,
  },
  actionDeleteTheme: {
    borderColor: palette.icon,
    borderWidth: 1,
  },
  addButtonTheme: {
    backgroundColor: palette.tint,
  },
  addButtonTextTheme: {
    color: palette.background,
  },
});
