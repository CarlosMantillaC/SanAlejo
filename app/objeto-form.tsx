import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  createObjeto,
  getObjetoById,
  type ObjetoInput,
  updateObjeto,
} from "@/lib/san-alejo-db";

export default function ObjetoFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    contenedorId?: string;
    objetoId?: string;
  }>();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? "light"];
  const isEditing = !!params.objetoId;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const inputThemeStyle = {
    borderColor: palette.icon,
    color: palette.text,
  };

  const saveButtonThemeStyle = {
    backgroundColor: palette.tint,
  };

  const saveButtonTextStyle = {
    color: palette.background,
  };

  useEffect(() => {
    async function loadObjeto() {
      if (!params.objetoId) {
        return;
      }

      const id = Number(params.objetoId);
      if (!Number.isFinite(id)) {
        return;
      }

      const existing = await getObjetoById(id);
      if (!existing) {
        return;
      }

      setNombre(existing.nombre);
      setDescripcion(existing.descripcion);
    }

    loadObjeto();
  }, [params.objetoId]);

  const onSave = async () => {
    const input: ObjetoInput = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
    };

    if (!input.nombre || !input.descripcion) {
      Alert.alert(
        "Campos obligatorios",
        "Debes completar nombre y descripción.",
      );
      return;
    }

    if (isEditing) {
      const id = Number(params.objetoId);

      if (!Number.isFinite(id)) {
        Alert.alert("Error", "ID de objeto inválido.");
        return;
      }

      await updateObjeto(id, input);
      router.back();
      return;
    }

    const contenedorId = Number(params.contenedorId);
    if (!contenedorId) {
      Alert.alert("Error", "No se encontró el contenedor para este objeto.");
      return;
    }

    if (!Number.isFinite(contenedorId)) {
      Alert.alert("Error", "ID de contenedor inválido.");
      return;
    }

    await createObjeto(contenedorId, input);
    router.back();
  };

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title">
        {isEditing ? "Editar objeto" : "Nuevo objeto"}
      </ThemedText>

      <ThemedText style={styles.label}>Nombre</ThemedText>
      <TextInput
        style={[styles.input, inputThemeStyle]}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej: Cable HDMI"
        placeholderTextColor={palette.icon}
      />

      <ThemedText style={styles.label}>Descripción</ThemedText>
      <TextInput
        style={[styles.input, styles.multiline, inputThemeStyle]}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Detalle del objeto"
        placeholderTextColor={palette.icon}
        multiline
        textAlignVertical="top"
      />

      <Pressable
        style={[styles.saveButton, saveButtonThemeStyle]}
        onPress={onSave}
      >
        <ThemedText type="defaultSemiBold" style={saveButtonTextStyle}>
          Guardar objeto
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
});