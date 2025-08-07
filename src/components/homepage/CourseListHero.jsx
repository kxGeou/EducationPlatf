import Access from "/access.svg";
import Excel from "/excel.svg";
import Forms from "/forms.svg";
import Python from "/python.svg";

function CourseListHero() {
  const courses = [
    {
      label: "Excel",
      icon: Excel,
    },
    {
      label: "Access",
      icon: Access,
    },
     {
      label: "Python",
      icon: Python,
    },
    {
      label: "Teoria",
      icon: Forms,
    },
    
   
  ];

  return (
    <section className="w-full">
      <ul className="grid grid-cols-2 grid-rows-2 lg:grid-cols-4 lg:grid-rows-1 w-full gap-4 px-4">
        {courses.map((courses, index) => (
            <li key={index} className="shadow-md bg-white border border-gray-100 rounded-[12px] flex justify-center items-center py-2 gap-2 flex-col transition-all hover:shadow-lg hover:scale-[1.025]  cursor-pointer dark:bg-DarkblackText dark:border-DarkblackBorder dark:hover:bg-DarkblackBorder">
                <img src={courses.icon} alt="#" className="w-10 lg:w-13"/>
                <p className="text-blackText dark:text-white">{courses.label}</p>
            </li>
        ))}
      </ul>
    </section>
  );
}

export default CourseListHero;
