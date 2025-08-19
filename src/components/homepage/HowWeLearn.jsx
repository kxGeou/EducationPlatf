import Fiszki from '../../assets/ikony/fiszki.svg';
import Test from '../../assets/ikony/test.svg';
import Video from '../../assets/ikony/video.svg';
import Zadan from '../../assets/ikony/zadan.svg';


function HowWeLearn() {

  const learnData = [
    {
      img: Video,
      title: "Nagrania wideo",
      description: "Krótkie, konkretne lekcje krok po kroku -tłumaczymy, pokazujemy, rozwiązujemy"
    },
    {
      img: Zadan,
      title: "Zadania i testy",
      description: "Zestawy ćwiczeń, zadania z matur i egzaminów - z rozwiązaniami i komentarzami"
    },
    {
      img: Test,
      title: "Materiały tekstowe",
      description: "Każde zagadnienie opisane prostym językiem. Nie musisz robić notatek -wszystko masz gotowe"
    },
    {
      img: Fiszki,
      title: "Fiszki i powtórki",
      description: "Szybka nauka i utrwalanie najważniejszych pojęć przed egzaminem"
    },
  ]


  return (
    <ul className='grid grid-cols-1 grid-rows-4 md:grid-rows-2 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-1 px-4 gap-6'>
      {learnData.map((l, index) => (
        <li key={index} className='border border-gray-100 dark:border-DarkblackBorder dark:bg-DarkblackBorder dark:text-white p-4 flex flex-col items-start justify-start shadow-lg rounded-[12px] transiton-all duration-300 hover:-translate-y-1.5 hover:shadow-xl'>
          <img src={l.img} className='w-12'/>  
          <p className='text-lg font-semibold mt-2'>{l.title}</p>
          <span className='opacity-75 font-light'>{l.description}</span>
        </li>
      ))}
    </ul>
  )
}

export default HowWeLearn