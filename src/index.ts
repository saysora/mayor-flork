// TODO:
// 1. Separate concerns
// 2. Hook it up to discord
// 3. Figure out a logical timeout for this to fire
// 4. Set some sort of wall to not make it fire too often
// 5. Limit conversation to 1 channel
const textUrl = 'https://raw.githubusercontent.com/ryanmcdermott/trump-speeches/master/speeches.txt';

async function getText() {
  const data = await fetch(textUrl);
  const text = await data.text();

  return text;
}

function createWordList(text: string) {
  // Array of words
  const word_list = [];

  // Remove newlines in favor of spaces
  const nl = text.replaceAll('\r', ' ').replaceAll('\n', ' ');

  // Split the big string into words separated by ' '
  const words = nl.split(' ');

  // For each word in the array of words
  for (const word of words) {

    // We don't want empty 'words'
    if (word !== ' ' && word !== '') {
      // add confirmed words to our word_list
      word_list.push(word);
    }

  }

  // return the array
  return word_list;
}

function buildChain(words: string[]) {

  /**
   * Map = kind of Object
   * chain.has('foo') // Tells us if the key of foo is in the map
   * chain.get('foo') // Returns the value of foo
   */
  const chain = new Map<string, string[]>();

  const word_count = words.length;

  // For each word
  words.forEach((w, i) => {
    // If the word_count > current words index + 1
    if (word_count > (i + 1)) {
      // Assign the word from the list of words (next word)
      const word = words[i + 1]

      // Check if the chain has the word as a key
      if (!chain.has(w)) {
        // Set the key and it's value to a list of 1
        chain.set(w, [word]);
      } else {
        // If the key exists we build the list
        const list = chain.get(w) ?? [];
        list.push(word);
        chain.set(w, list);
      }
    }
  })


  return {
    chain,
    size: chain.size
  }

}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const text = await getText();

  const list = createWordList(text);

  const { chain } = buildChain(list);

  const chainArr = Array.from(chain.entries());

  let word1 = getRandomItem(chainArr);
  let sentence = word1[0];

  while (sentence.length < 400) {
    const word2 = getRandomItem(word1[1])
    sentence += ` ${word2}`
    const new_word = chain.get(word2);
    if (!new_word) {
      break;
    }

    word1 = [word2, new_word];
  }

  console.log(sentence);


}

void main();
