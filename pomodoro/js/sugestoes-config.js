// Caixa de sugestões.
// emailKey: chave do Web3Forms (web3forms.com > digite seu e-mail > a chave chega no e-mail). Vazia = só guarda no Firebase.
//   A chave não é senha: ela só serve para mandar mensagens para o seu e-mail.
// admins: e-mails das contas que veem a aba "recebidas". Se mudar aqui, mude também em firebase-regras.txt (função isAdmin).
export default {
  emailKey: '',
  admins: ['maariapcardoso@gmail.com']
};
