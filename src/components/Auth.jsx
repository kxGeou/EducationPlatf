import { useState } from "react";
import {supabase} from '../util/supabaseClient'
import { useNavigate } from 'react-router-dom';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    async function signUp() {
        setLoading(true);
        setError(null)

        const {error } = await supabase.auth.signUp({email, password})
        if(error) setError(error.message);
        else alert("Zarejestrowany")
        setLoading(false)
    }

    async function signIn() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        setError(error.message)
    } 
    else {navigate('/'); }
    setLoading(false);
    }

    
    return (
        <div className="flex flex-col justify-center items-center gap-4 h-screen bg-[#252525] text-white">
            <h2>Zaloguj się lub zarejestruj</h2>
            <input className="bg-slate-600 px-4 py-2 text-white" type="emai" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
            <input className="bg-slate-600 px-4 py-2" type="emai" placeholder="Hasło" value={password} onChange={e => setPassword(e.target.value)}/>

            <button onClick={signIn} className="bg-green-700 px-4 py-2">Zaloguj się</button>
            <button onClick={signUp} className="bg-red-700 px-4 py-2">Zarejestruj się</button>
            {error && <p className="text-red-600">{error}</p>}
        </div>
    )
}