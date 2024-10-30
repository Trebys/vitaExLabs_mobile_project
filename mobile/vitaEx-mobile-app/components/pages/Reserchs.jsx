import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import axios from "axios";
import { WordIcon, SerchIcon, CheckIcon } from "../Icons"; // Usa tus iconos personalizados

export function Reserchs() {
  const [searchQuery, setSearchQuery] = useState("envejecimiento"); // Búsqueda predeterminada
  const [researchData, setResearchData] = useState([]);

  // Función para obtener estudios desde PubMed usando la API
  const fetchResearches = async () => {
    const apiKey = "edc505e285720faab52d9292db87ad3ba808"; // Reemplaza con tu API key
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${searchQuery}&retmode=json&retmax=10&api_key=${apiKey}`;

    try {
      const response = await axios.get(url);
      const idList = response.data.esearchresult.idlist;

      // Verifica si idList tiene resultados
      if (!idList || idList.length === 0) {
        console.error("No se encontraron resultados para la búsqueda.");
        return;
      }

      // Llamada a ESummary para obtener detalles de los estudios
      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(",")}&retmode=json&api_key=${apiKey}`;
      const summaryResponse = await axios.get(summaryUrl);
      const results = Object.values(summaryResponse.data.result).filter(
        (item) => item.uid,
      );
      setResearchData(results);
    } catch (error) {
      console.error("Error fetching research data: ", error);
    }
  };

  useEffect(() => {
    fetchResearches(); // Obtener datos de la API en el primer render
  }, []);

  return (
    <View style={styles.container}>
      {/* Parte superior del diseño */}
      <View style={styles.headerContainer}>
        <WordIcon size={40} color="green" />
        <Text style={styles.title}>Estudios Globales de (API)</Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Estudios envejecimiento"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          onSubmitEditing={fetchResearches} // Hace la búsqueda al presionar "enter"
        />
        <Pressable style={styles.searchButton} onPress={fetchResearches}>
          <SerchIcon size={20} />
        </Pressable>
      </View>

      {/* Botones de ordenar y filtro */}
      <View style={styles.actionContainer}>
        <Pressable style={styles.actionButton}>
          <CheckIcon size={24} />
          <Text style={styles.actionText}>Sort</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <CheckIcon size={24} color="green" />
          <Text style={styles.actionText}>Filter</Text>
          <View style={styles.filterBadge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </Pressable>
      </View>

      {/* Lista de resultados */}
      <FlatList
        data={researchData}
        keyExtractor={(item) => item.uid.toString()}
        renderItem={({ item }) => (
          <View style={styles.researchItem}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.source}>Fuente: {item.source}</Text>
            <Text style={styles.pubDate}>Publicado en: {item.pubdate}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  searchButton: {
    padding: 8,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    fontSize: 16,
    marginLeft: 4,
  },
  filterBadge: {
    backgroundColor: "green",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
  },
  researchItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
});
