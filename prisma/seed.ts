// Este ficheiro coloca dados de exemplo na base de dados para podermos testar a aplicação sem precisar de emails reais.

import { PrismaClient } from "@prisma/client";

// Criamos uma ligação à base de dados para poder escrever dados nela
const prisma = new PrismaClient();

// Função auxiliar: recebe um número de dias e devolve a data correspondente no passado
// Por exemplo, diasAtras(5) devolve a data de há 5 dias
function diasAtras(dias: number): Date {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data;
}

// Lista com os 10 emails fictícios de clientes da Agence Dupont, Tours
// category fica a null porque será a IA a preencher mais tarde
// status começa sempre como "pendente" porque ainda ninguém respondeu
const emailsFicticios = [
  {
    // Email 1 — pedido de visita a um apartamento
    from: "marie.lefevre@gmail.com",
    subject: "Demande de visite – Appartement rue Nationale",
    body: `Bonjour,

Je me permets de vous contacter suite à votre annonce concernant l'appartement situé rue Nationale à Tours. Il correspond tout à fait à ce que je recherche : 3 pièces, lumineux, proche du centre.

Serait-il possible d'organiser une visite ce week-end, samedi 1er juin en fin de matinée ou dimanche 2 juin dans l'après-midi ?

Je suis disponible par téléphone au 06 12 34 56 78 si vous avez besoin de me joindre.

Dans l'attente de votre retour, je vous adresse mes cordiales salutations.

Marie Lefèvre`,
    receivedAt: diasAtras(1),
    category: null,
    status: "pendente",
  },

  {
    // Email 2 — pergunta sobre o preço de uma moradia
    from: "thomas.bernard@orange.fr",
    subject: "Question sur le prix – Maison avenue de Grammont",
    body: `Bonjour Madame, Monsieur,

J'ai vu votre annonce pour la maison avenue de Grammont affichée à 385 000 €. Je souhaiterais savoir si ce prix est négociable, et si des travaux importants sont à prévoir dans les prochaines années (toiture, plomberie, électricité).

Par ailleurs, quel est le montant des charges annuelles (taxe foncière, charges de copropriété le cas échéant) ?

Merci d'avance pour vos informations.

Cordialement,
Thomas Bernard`,
    receivedAt: diasAtras(2),
    category: null,
    status: "pendente",
  },

  {
    // Email 3 — reclamação sobre falta de resposta da agência
    from: "isabelle.moreau@hotmail.fr",
    subject: "Absence de réponse – Dossier de location en attente",
    body: `Bonjour,

Je me permets de revenir vers vous car je n'ai toujours pas reçu de réponse à mon email envoyé il y a 10 jours concernant mon dossier de location pour l'appartement T2 rue du Commerce.

J'ai fourni tous les documents demandés (bulletins de salaire, avis d'imposition, pièce d'identité, RIB) et je n'ai eu aucun retour de votre part. Cette situation me met en difficulté car je dois quitter mon logement actuel fin juin.

Je vous demande de bien vouloir me répondre dans les plus brefs délais.

Cordialement,
Isabelle Moreau
Tél : 06 87 65 43 21`,
    receivedAt: diasAtras(3),
    category: null,
    status: "pendente",
  },

  {
    // Email 4 — pedido de informação geral sobre imóveis disponíveis
    from: "pierre.dubois@sfr.fr",
    subject: "Recherche d'un bien à acheter – Budget 250 000 €",
    body: `Bonjour,

Mon épouse et moi sommes à la recherche d'un bien immobilier sur Tours ou ses environs proches (Saint-Avertin, Joué-lès-Tours, La Riche). Notre budget est de 250 000 € maximum, pour un bien de type T3 ou T4 avec jardin ou terrasse.

Nous avons deux enfants, donc la proximité d'écoles et de commerces est importante pour nous.

Avez-vous des biens correspondant à ces critères en portefeuille actuellement, ou attendez-vous de nouvelles entrées prochainement ?

Merci pour votre aide.

Pierre Dubois`,
    receivedAt: diasAtras(5),
    category: null,
    status: "pendente",
  },

  {
    // Email 5 — reclamação sobre o estado do apartamento aquando da entrada
    from: "nathalie.simon@gmail.com",
    subject: "Problème constaté à l'entrée dans le logement",
    body: `Madame, Monsieur,

Je suis entrée dans mon appartement (rue Blaise Pascal, Tours) le 15 mai dernier et j'ai constaté plusieurs problèmes non mentionnés lors de l'état des lieux : un robinet qui fuit dans la salle de bain, une fenêtre du salon qui ferme mal, et des traces d'humidité visibles dans le coin de la chambre.

J'ai pris des photos que je tiens à votre disposition. Ces problèmes nécessitent une intervention rapide, surtout la fenêtre car je vis seule et cela pose un problème de sécurité.

Merci de me confirmer que vous avez bien pris en compte ma demande et de m'indiquer quand un technicien peut intervenir.

Nathalie Simon`,
    receivedAt: diasAtras(7),
    category: null,
    status: "pendente",
  },

  {
    // Email 6 — pedido de visita a uma moradia com jardim
    from: "julien.petit@yahoo.fr",
    subject: "Visite souhaitée – Pavillon avec jardin à Saint-Avertin",
    body: `Bonjour,

Votre annonce pour le pavillon avec jardin à Saint-Avertin a retenu toute notre attention. Nous sommes une famille de quatre personnes et nous cherchons exactement ce type de bien : maison individuelle, jardin clos, garage.

Nous souhaiterions organiser une visite en semaine, de préférence un mardi ou jeudi en fin de journée après 18h, ou bien le samedi matin.

Nous sommes déjà propriétaires d'un bien en cours de vente, donc notre projet est concret et notre financement en bonne voie.

Merci de nous contacter pour fixer un rendez-vous.

Julien et Sophie Petit`,
    receivedAt: diasAtras(8),
    category: null,
    status: "pendente",
  },

  {
    // Email 7 — pergunta sobre condições de arrendamento
    from: "camille.rousseau@live.fr",
    subject: "Conditions de location – Studio centre-ville",
    body: `Bonjour,

Je suis étudiante en master à l'Université de Tours et je cherche un studio pour la rentrée de septembre. J'ai vu votre annonce pour un studio de 22m² situé rue Colbert et j'aurais quelques questions avant de me positionner :

– Le loyer de 490 € est-il charges comprises ?
– Le propriétaire accepte-t-il les garants en ligne (type Garantme) ?
– Y a-t-il internet inclus ou dois-je souscrire moi-même ?
– L'appartement est-il disponible dès le 1er septembre ?

Merci d'avance pour vos réponses.

Camille Rousseau`,
    receivedAt: diasAtras(10),
    category: null,
    status: "pendente",
  },

  {
    // Email 8 — reclamação sobre comissões cobradas pela agência
    from: "francois.martin@gmail.com",
    subject: "Contestation des honoraires d'agence",
    body: `Madame, Monsieur,

Suite à la signature de mon bail en avril, j'ai été facturé 850 € d'honoraires d'agence. Or, selon la loi ALUR, les honoraires à la charge du locataire sont plafonnés en fonction de la zone géographique et de la surface du bien.

Pour un appartement de 45m² en zone tendue (Tours), le plafond légal est de 10 €/m² pour l'état des lieux et 11 €/m² pour les frais de mise en location, soit un total maximum de 945 €. Mon contrat mentionne 850 €, ce qui semble dans la limite, mais la facture détaillée que j'ai reçue ne correspond pas aux postes indiqués dans le bail.

Je vous demande de me fournir une facture détaillée conforme à la réglementation en vigueur.

François Martin`,
    receivedAt: diasAtras(14),
    category: null,
    status: "pendente",
  },

  {
    // Email 9 — pedido de estimativa de valor de imóvel para venda
    from: "anne.girard@wanadoo.fr",
    subject: "Estimation de mon bien – Maison Joué-lès-Tours",
    body: `Bonjour,

Je songe à vendre ma maison située à Joué-lès-Tours (quartier Rabière) et j'aimerais obtenir une estimation gratuite de sa valeur actuelle sur le marché.

Le bien est une maison de plain-pied de 110m², 4 chambres, garage double, jardin de 400m², construite en 1985 et entretenue régulièrement. Des travaux de rénovation de la cuisine ont été réalisés en 2021.

Seriez-vous disponible pour venir effectuer une estimation sur place ? Je suis disponible en semaine après 17h et le samedi toute la journée.

Merci pour votre retour.

Anne Girard`,
    receivedAt: diasAtras(18),
    category: null,
    status: "pendente",
  },

  {
    // Email 10 — pedido de informação sobre investimento locativo
    from: "marc.leblond@entreprise.com",
    subject: "Investissement locatif – Recherche immeuble de rapport",
    body: `Bonjour,

Je suis investisseur immobilier et je recherche activement un immeuble de rapport sur l'agglomération de Tours. Mon budget est compris entre 400 000 € et 600 000 €.

Je recherche un immeuble avec au minimum 4 à 6 lots, idéalement déjà loués ou facilement louables, avec un rendement brut espéré d'au moins 7 %. Je suis ouvert aux biens nécessitant des travaux si le prix est cohérent.

Avez-vous ce type de produit en portefeuille ou des opportunités en off-market ? Je suis réactif et ma décision d'achat peut intervenir rapidement si le dossier est solide.

Marc Leblond
Gérant – SCI Leblond Patrimoine`,
    receivedAt: diasAtras(25),
    category: null,
    status: "pendente",
  },
];

// Função principal que apaga os dados antigos e insere os emails de exemplo
async function main() {
  // Avisamos no terminal que o processo começou
  console.log("A iniciar o seed da base de dados...");

  // Apagamos todos os registos antigos para começar do zero sem duplicados
  // Primeiro as respostas (porque dependem dos emails), depois os emails
  await prisma.response.deleteMany();
  await prisma.email.deleteMany();
  console.log("Registos antigos apagados.");

  // Inserimos todos os emails de uma vez só usando createMany
  // É mais rápido do que inserir um a um
  const resultado = await prisma.email.createMany({
    data: emailsFicticios,
  });

  // Mostramos no terminal quantos emails foram inseridos
  console.log(`✅ ${resultado.count} emails inseridos com sucesso!`);
}

// Chamamos a função principal e tratamos de qualquer erro que possa acontecer
main()
  .catch((erro) => {
    // Se algo correu mal, mostramos o erro e saímos com código de falha
    console.error("Erro durante o seed:", erro);
    process.exit(1);
  })
  .finally(async () => {
    // Fechamos sempre a ligação à base de dados no final, mesmo que haja erro
    await prisma.$disconnect();
  });
