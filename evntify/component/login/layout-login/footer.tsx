export default function Footer(){
    return(
        <footer className= "w-full py-4 px-6 text-center text-xs text-slate-400 relative z-10 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto border-t border-white/40">
            <div className = "flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                <span>System Status: Event Gateway Active</span>
            </div>
            <div className="mt-2 sm:mt-0 flex gap-4 text-slate-500 font-medium">
                <a className="hover:text-slate-800 transition" href="#terms">
                     Terms of Service
                </a>
                <span>•</span>
                <a className="hover:text-slate-800 transition" href="#privacy">
                     Campus Privacy Policy
                </a>
                <span>•</span>
                <a className="hover:text-slate-800 transition" href="#support">
                    Student Council Helpdesk
                </a>
      </div>
    </footer>
    );
    
}