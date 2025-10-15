import { View, Text, Button, StyleSheet, FlatList, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { db, initDb } from "../data/db";

initDb();

function getTreinos() {
  return db.getAllSync('SELECT * FROM treinos');
}

function insertTreino(atividade, duracaoMin, categoria) {
  db.runSync('INSERT INTO treinos (atividade, duracaoMin, categoria) VALUES (?, ?, ?)', [atividade, duracaoMin, categoria]);
}

function deleteTreino(id) {
  db.runSync('DELETE FROM treinos WHERE id = ?', [id]);
}
function contaTreinos() {
  const [resultado] = db.getAllSync('SELECT COUNT(*) FROM treinos');
  return resultado['COUNT(*)']; 
}

function getTreinoById(id) {
  const [treino] = db.getAllSync('SELECT * FROM treinos WHERE id = ?', [id]);
  return treino;
}

function updateTreino(id, atividade, duracaoMin, categoria) {
  db.runSync('UPDATE treinos SET atividade = ?, duracaoMin = ?, categoria = ? WHERE id = ?', [atividade, duracaoMin, categoria, id]);
}

export default function sqlite() {
  const [atividade, setAtividade] = useState("");
  const [duracaoMin, setDuracaoMin] = useState("");
  const [categoria, setCategoria] = useState("");
  const [treinos, setTreinos] = useState([]);
  const [contador, setContador] = useState(0);
  const [editandoId, setEditandoId] = useState(null);

  function limparCampos() {
    setAtividade("");
    setDuracaoMin("");
    setCategoria("");
  }

  function salvarTreino() {
    const at = atividade.trim();
    const cat = categoria.trim();
    const dur = parseInt(duracaoMin);
    if (!at || !dur || !cat) return;
    insertTreino(at, dur,cat);
    limparCampos();
    carregarTreinos();
  }

  function carregarTreinos() {
    setTreinos(getTreinos());
  }

  function excluirTreino(id) {
    deleteTreino(id);
    carregarTreinos();
  }

  function editarTreino(id) {
    const t = getTreinoById(id);
    if (!t) return;
    setAtividade(t.atividade);
    setDuracaoMin(String(t.duracaoMin));
    setCategoria(t.categoria);
    setEditandoId(id);
  }

  function atualizarTreino() {
    const at = atividade.trim();
    const cat = categoria.trim();
    const dur = parseInt(duracaoMin);
    if (!at || !dur || !cat || !editandoId) return;
    updateTreino(editandoId, at, dur, cat);
    limparCampos();
    setEditandoId(null);
    carregarTreinos();
  }

  useEffect(() => {
    carregarTreinos();
  }, []);
  useEffect(() => {
  const qt = contaTreinos();
  setContador(qt);
}, [treinos]);

  return (
    <SafeAreaView style={estilos.container}>
      <Text style={estilos.titulo}>Registro de Treinos</Text>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Total de treinos: {contador}
        </Text>

  <View style={estilos.secaoFormulario}>
        <TextInput
          value={atividade}
          onChangeText={setAtividade}
          placeholder="Atividade (ex.: Musculação)"
          multiline={true}
          numberOfLines={4}
          style={[estilos.campoTexto, estilos.campoAtividade]}
        />

        <TextInput
          value={duracaoMin}
          onChangeText={setDuracaoMin}
          placeholder="Duração (min)"
          keyboardType="numeric"
          style={estilos.campoTexto}
        />

        <TextInput
          value={categoria}
          onChangeText={setCategoria}
          placeholder="Categoria (ex.: Cardio)"
          style={estilos.campoTexto}
        />
      </View>

      <View style={estilos.secaoControles}>
        <View style={estilos.linhaAcoesControles}>
          <View style={estilos.botaoAcao}><Button title="Salvar" onPress={salvarTreino} disabled={!!editandoId} /></View>
          <View style={estilos.botaoAcao}><Button title="Atualizar" onPress={atualizarTreino} disabled={!editandoId} /></View>
          <View style={estilos.botaoAcao}><Button title="Limpar" onPress={limparCampos} /></View>
        </View>

        <View style={estilos.linhaCarregar}><Button title="Carregar treinos" onPress={carregarTreinos} /></View>
        
      </View>

      <FlatList
        data={treinos}
        keyExtractor={(item) => String(item.id)}
        style={{ flex: 1, marginTop: 8 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={estilos.itemLinha}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.textoItem}>{item.atividade}  {item.duracaoMin } {item.categoria}</Text>
            </View>
            <View style={estilos.acoesLinha}>
              <View style={estilos.botaoAcao}><Button title="Editar" onPress={() => editarTreino(item.id)} /></View>
              <View style={estilos.botaoAcao}><Button title="Excluir" color="#b91c1c" onPress={() => excluirTreino(item.id)} /></View>
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

