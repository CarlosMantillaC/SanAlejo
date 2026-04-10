import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  createContenedor,
  getContenedorById,
  updateContenedor,
  type ContenedorInput,
} from "@/lib/san-alejo-db";

const palette = Colors.light;

export default function ContenedorFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const isEditing = !!params.id;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  useEffect(() => {
    async function loadContenedor() {
      if (!params.id) {
        return;
      }

      const id = Number(params.id);
      if (!Number.isFinite(id)) {
        return;
      }

      const existing = await getContenedorById(id);
      if (!existing) {
        return;
      }

      setNombre(existing.nombre);
      setDescripcion(existing.descripcion);
      setUbicacion(existing.ubicacion);
    }

    loadContenedor();
  }, [params.id]);

  const onSave = async () => {
    const input: ContenedorInput = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      ubicacion: ubicacion.trim(),
    };

    if (!input.nombre || !input.descripcion || !input.ubicacion) {
      Alert.alert(
        "Campos obligatorios",
        "Debes completar nombre, descripción y ubicación.",
      );
      return;
    }

    if (isEditing) {
      const id = Number(params.id);

      if (!Number.isFinite(id)) {
        Alert.alert("Error", "ID de contenedor inválido.");
        return;
      }

      await updateContenedor(id, input);
    } else {
      await createContenedor(input);
    }

    router.back();
  };

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title">
        {isEditing ? "Editar contenedor" : "Nuevo contenedor"}
      </ThemedText>

      <ThemedText style={styles.label}>Nombre</ThemedText>
      <TextInput
        style={[styles.input, styles.inputTheme]}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej: Caja cocina"
        placeholderTextColor={palette.icon}
      />

      <ThemedText style={styles.label}>Descripción</ThemedText>
      <TextInput
        style={[styles.input, styles.multiline, styles.inputTheme]}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Qué contiene este contenedor"
        placeholderTextColor={palette.icon}
        multiline
        textAlignVertical="top"
      />

      <ThemedText style={styles.label}>Ubicación</ThemedText>
      <TextInput
        style={[styles.input, styles.inputTheme]}
        value={ubicacion}
        onChangeText={setUbicacion}
        placeholder="Dónde está guardado"
        placeholderTextColor={palette.icon}
      />

      <Pressable
        style={[styles.saveButton, styles.saveButtonTheme]}
        onPress={onSave}
      >
        <ThemedText type="defaultSemiBold" style={styles.saveButtonText}>
          Guardar contenedor
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  label: {
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multiline: {
    minHeight: 90,
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
  },
  inputTheme: {
    borderColor: palette.icon,
    color: palette.text,
  },
  saveButtonTheme: {
    backgroundColor: palette.tint,
  },
  saveButtonText: {
    color: palette.background,
  },
});