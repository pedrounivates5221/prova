import { View, Text, Button, StyleSheet, FlatList, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { db, initDb } from "../data/db";

initDb();

function getFilmes() {
  return db.getAllSync('SELECT * FROM filmes');
}

function insertFilmes(titulo, ano, genero) {
  db.runSync('INSERT INTO filmes (titulo, ano, genero) VALUES (?, ?, ?)', [titulo, ano, genero]);
}

function deleteFilmes(id) {
  db.runSync('DELETE FROM filmes WHERE id = ?', [id]);
}

function contaFilmes() {
  const [resultado] = db.getAllSync('SELECT COUNT(*) FROM filmes');
  return resultado['COUNT(*)']; 
}

function getFilmesById(id) {
  const [filmes] = db.getAllSync('SELECT * FROM filmes WHERE id = ?', [id]);
  return filmes;
}

function updateFilmes(id, titulo, ano, genero) {
  db.runSync('UPDATE filmes SET titulo = ?, ano = ?, genero = ? WHERE id = ?', [titulo, ano, genero, id]);
}

export default function sqlite() {
  const [titulo, setTitulo] = useState("");
  const [ano, setAno] = useState("");
  const [genero, setGenero] = useState("");
  const [filmes, setFilmes] = useState([]);
  const [contador, setContador] = useState(0);
  const [editandoId, setEditandoId] = useState(null);

  function limparCampos() {
    setTitulo("");
    setAno("");
    setGenero("");
  }

  function salvarFilmes() {
    const ti = titulo.trim();
    const gen = genero.trim();
    const an = parseInt(ano);
    if (!ti || !an || !gen) return;
    insertFilmes(ti, an,gen);
    limparCampos();
    carregarFilmes();
  }

  function carregarFilmes() {
    setFilmes(getFilmes());
  }
  function deleteTudo() {
  db.runSync('DELETE FROM filmes ');
  carregarFilmes();
}

  function excluirFilmes(id) {
    deleteFilmes(id);
    carregarFilmes();
  }

  function editarFilmes(id) {
    const f = getFilmesById(id);
    if (!f) return;
    setTitulo(f.titulo);
    setAno(String(f.ano));
    setGenero(f.genero);
    setEditandoId(id);
  }

  function atualizarFilmes() {
    const ti = titulo.trim();
    const gen = genero.trim();
    const an = parseInt(ano);
    if (!ti || !gen || !an || !editandoId) return;
    updateFilmes(editandoId, ti, an, gen);
    limparCampos();
    setEditandoId(null);
    carregarFilmes();
  }

  useEffect(() => {
    carregarFilmes();
  }, []);
  useEffect(() => {
  const qt = contaFilmes();
  setContador(qt);
}, [filmes]);

  return (
    <SafeAreaView style={estilos.container}>
      <Text style={estilos.titulo}>Meus filmes</Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Total de filmes: {contador}
        </Text>

  <View style={estilos.secaoFormulario}>
        <TextInput
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Digite o titulo"
          multiline={true}
          numberOfLines={4}
          style={[estilos.campoTexto, estilos.campoAtividade]}
        />

        <TextInput
          value={ano}
          onChangeText={setAno}
          placeholder="ano lancamento"
          keyboardType="numeric"
          style={estilos.campoTexto}
        />

        <TextInput
          value={genero}
          onChangeText={setGenero}
          placeholder="Genero do filme"
          style={estilos.campoTexto}
        />
      </View>

      <View style={estilos.secaoControles}>
        <View style={estilos.linhaAcoesControles}>
          <View style={estilos.botaoAcao}><Button title="Salvar" onPress={salvarFilmes} disabled={!!editandoId} /></View>
          <View style={estilos.botaoAcao}><Button title="Atualizar" onPress={atualizarFilmes} disabled={!editandoId} /></View>
          <View style={estilos.botaoAcao}><Button title="Limpar" onPress={limparCampos} /></View>
          <View style={estilos.botaoAcao}><Button title="Excluir Tudo"  color="#b91c1c" onPress={deleteTudo} /></View>
        </View>

    
        
      </View>

      <FlatList
        data={filmes}
        keyExtractor={(item) => String(item.id)}
        style={{ flex: 1, marginTop: 8 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={estilos.itemLinha}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.textoItem}>{item.titulo}  {item.ano } {item.genero}</Text>
            </View>
            <View style={estilos.acoesLinha}>
              <View style={estilos.botaoAcao}><Button title="Editar" onPress={() => editarFilmes(item.id)} /></View>
              <View style={estilos.botaoAcao}><Button title="Excluir" color="#b91c1c" onPress={() => excluirFilmes(item.id)} /></View>
            </View>
          </View>
        )}
      />

      <View style={estilos.rodape}>
        <Button title="Voltar" onPress={() => router.back()} />
        <Button title="Início" onPress={() => router.replace("/")} />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16 
  },
  titulo: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginBottom: 8 
  },
  linhaEntrada: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 8, 
    gap: 8 
  },
  linhaEntradaVertical: {
    flexDirection: "column",
    marginBottom: 8,
  },
  secaoFormulario: {
    width: '100%',
    marginBottom: 12,
    paddingBottom: 12,
    flexShrink: 0,
  },
  secaoControles: {
    marginBottom: 12,
    flexShrink: 0,
  },
  linhaCarregar: {
    marginTop: 6,
    alignItems: 'flex-start',
  },
  campoTexto: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    fontSize: 16,
    marginBottom: 8,
  },
  campoAtividade: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textoItem: { 
    fontSize: 16, 
    paddingVertical: 6,
    marginRight: 8,
  },
  itemLinha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  acoesLinha: {
    flexDirection: "row",
    alignItems: 'center',
  },
  linhaAcoesControles: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  botaoAcao: {
    marginRight: 8,
  },
  rodape: { 
    flexDirection: "row",
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
});

