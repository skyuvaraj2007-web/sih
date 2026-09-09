import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Play, CheckCircle2, Clock, Sparkles, ShieldCheck, Award,
  Flame, BarChart3, TrendingUp, Activity, Download, ExternalLink, Search
} from "lucide-react";
import {
  getEnrollments, enrollCourse, advanceModule, getCredentials, seedDemoEnrollments
} from "../services/studentStore";
import { getCoursesByCollegeId } from "../services/collegeDirectory";
import {
  getCoursesByInstitution,
  enrollStudentInCourse,
  advanceStudentCourseModule,
  getRelationalStudentById
} from "../services/nexusDataStore";
import { learningService } from "../services/learningService";
import SkillDetailsModal from "../components/student/SkillDetailsModal";

const CAT_COLORS = {
  "DATA & AI":"#28D7FF","BY NEXUS AI":"#8B5CF6","DATABASE":"#2FE0A1",
  "ANALYTICS":"#3478FF","ML":"#F59E0B","DEEP LEARNING":"#EC4899",
  "WEB DEV":"#06B6D4","CLOUD":"#6366F1","SECURITY":"#10B981",
  "APTITUDE":"#F97316","NLP":"#A78BFA","IOT":"#34D399",
  "JAVA":"#FB923C","SYSTEMS":"#818CF8","BLOCKCHAIN":"#F472B6"
};
const catColor = (cat) => CAT_COLORS[cat] || "#28D7FF";

function getStudentAuth() {
  try {
    const raw = localStorage.getItem("nexus_auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const TABS = ["Overview","My Enrolled Courses","Course Catalog","Skill Growth & Analytics","Certificates & Badges"];

/* ─── Overview ─── */
function OverviewPanel({ enrollments = [], onResume, onCompleteModule, setActiveTab, user }) {
  const completedCount = enrollments.filter(e => e.status === "completed" || e.progress >= 100).length;
  const inProgressCount = enrollments.filter(e => e.status === "active" || (e.progress > 0 && e.progress < 100)).length;
  const totalHours = enrollments.reduce((s, e) => s + (Number(e.completedModules) || 0) * 2, 0);
  const overallPct = enrollments.length > 0 ? Math.round(enrollments.reduce((s, e) => s + (Number(e.progress) || 0), 0) / enrollments.length) : 0;

  // Real, genuine skill calculations or authentic 0% if no activity
  const logicCourses = enrollments.filter(e => e.category === "APTITUDE" || (e.courseTitle && e.courseTitle.toLowerCase().includes("logic")));
  const logicVal = logicCourses.length > 0 ? Math.round(logicCourses.reduce((s, c) => s + (c.progress || 0), 0) / logicCourses.length) : 0;

  const aptCourses = enrollments.filter(e => e.category === "APTITUDE");
  const aptVal = aptCourses.length > 0 ? Math.round(aptCourses.reduce((s, c) => s + (c.progress || 0), 0) / aptCourses.length) : 0;

  const progCourses = enrollments.filter(e => ["WEB DEV", "JAVA", "SYSTEMS", "DATA & AI"].includes(e.category));
  const progVal = progCourses.length > 0 ? Math.round(progCourses.reduce((s, c) => s + (c.progress || 0), 0) / progCourses.length) : 0;

  const advCourses = enrollments.filter(e => ["ML", "DEEP LEARNING", "BY NEXUS AI", "CLOUD", "SECURITY"].includes(e.category));
  const advVal = advCourses.length > 0 ? Math.round(advCourses.reduce((s, c) => s + (c.progress || 0), 0) / advCourses.length) : 0;

  const weeklyDays = [
    { day: "Mon", height: totalHours > 0 ? Math.min(100, Math.round(totalHours * 4)) : 0 },
    { day: "Tue", height: totalHours > 0 ? Math.min(100, Math.round(totalHours * 5)) : 0 },
    { day: "Wed", height: totalHours > 0 ? Math.min(100, Math.round(totalHours * 3)) : 0 },
    { day: "Thu", height: totalHours > 0 ? Math.min(100, Math.round(totalHours * 6)) : 0 },
    { day: "Fri", height: totalHours > 0 ? Math.min(100, Math.round(totalHours * 5)) : 0 },
    { day: "Sat", height: totalHours > 0 ? Math.min(100, Math.round(totalHours * 4)) : 0, live: totalHours > 0 },
    { day: "Sun", height: 0 }
  ];

  const streakDays = totalHours > 0 ? 1 : 0;

  return (
    <>
      <div style={{display:"grid",gridTemplateColumns:"minmax(280px,320px) minmax(320px,1fr) minmax(240px,280px)",gap:"20px",marginBottom:"28px"}}>
        <div className="glass-panel" style={{padding:"22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
            <div>
              <div style={{fontSize:"10px",color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>GLOBAL READINESS</div>
              <div style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)"}}>Overall Learning Progress</div>
            </div>
            <span className="cyber-badge badge-cyan" style={{fontSize:"9px"}}>Weighted Avg</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"20px"}}>
            <div style={{width:"90px",height:"90px",borderRadius:"50%",background:"radial-gradient(circle,#0D162C 60%,rgba(0,212,255,0.2) 100%)",border:"3px solid var(--cyber-cyan)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:"var(--cyber-cyan-glow)"}}>
              <span style={{fontSize:"24px",fontWeight:900,color:"var(--text-primary)",fontFamily:"var(--font-mono)"}}>{overallPct}%</span>
              <span style={{fontSize:"9px",color:"var(--text-muted)",textTransform:"uppercase"}}>MASTERY</span>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:"6px",fontSize:"11.5px"}}>
              {[["Logical Reasoning",`${logicVal}%`,"var(--text-primary)"],["Aptitude",`${aptVal}%`,"var(--text-primary)"],["Programming",`${progVal}%`,"var(--cyber-cyan)"],["Advanced Tech",`${advVal}%`,"var(--cyber-purple)"]].map(([lbl,val,col])=>(
                <div key={lbl} style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"var(--text-secondary)"}}>{lbl}</span>
                  <strong style={{color:col}}>{val}</strong>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:"16px",paddingTop:"12px",borderTop:"1px solid var(--border-subtle)",fontSize:"11px",color:"var(--cyber-emerald)",fontFamily:"var(--font-mono)"}}>
            <span>• Direct Ledger Proof Sync: {totalHours > 0 ? "Active" : "Ready"}</span>
            <span style={{color:"var(--text-muted)"}}>{totalHours > 0 ? "Block #8941" : "No blocks yet"}</span>
          </div>
        </div>
        <div className="glass-panel" style={{padding:"22px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
            <div>
              <div style={{fontSize:"10px",color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>EFFORT INDEX</div>
              <div style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)"}}>Weekly Learning Activity</div>
            </div>
            <div style={{textAlign:"right"}}>
              <span style={{fontSize:"18px",fontWeight:800,color:"var(--text-primary)",fontFamily:"var(--font-mono)"}}>{totalHours}.0h</span>
              <span style={{fontSize:"11px",color:"var(--text-muted)",marginLeft:"4px"}}>Total</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",height:"90px",padding:"10px 10px 0",borderBottom:"1px solid var(--border-subtle)"}}>
            {weeklyDays.map((d,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"6px"}}>
                {d.live && <span style={{fontSize:"8px",color:"var(--cyber-cyan)",fontFamily:"var(--font-mono)",textTransform:"uppercase"}}>Live</span>}
                <div style={{width:"24px",height:`${d.height}%`,background:d.live?"var(--cyber-cyan)":"linear-gradient(180deg,#3B82F6 0%,#1D4ED8 100%)",borderRadius:"4px 4px 0 0",boxShadow:d.live?"var(--cyber-cyan-glow)":"none",transition:"height 0.3s"}} />
                <span style={{fontSize:"10px",color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>{d.day}</span>
              </div>
            ))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:"12px",fontSize:"11px",color:"var(--text-secondary)"}}>
            <span>Weekly Target: <strong>20.0h</strong></span>
            <span style={{color: totalHours > 0 ? "var(--cyber-emerald)" : "var(--text-muted)", fontWeight:600}}>
              {totalHours > 0 ? `▲ ${Math.min(100, Math.round((totalHours / 20) * 100))}% Hit` : "0% Hit"}
            </span>
          </div>
        </div>
        <div className="glass-panel" style={{padding:"22px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
              <Clock size={16} color="var(--cyber-cyan)" />
              <div>
                <div style={{fontSize:"22px",fontWeight:800,color:"var(--text-primary)",fontFamily:"var(--font-mono)",lineHeight:1}}>{totalHours}<span style={{fontSize:"13px"}}>h</span></div>
                <div style={{fontSize:"10.5px",color:"var(--text-muted)"}}>TOTAL LEARNING</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",background:"rgba(245,158,11,0.08)",borderRadius:"8px",border:"1px solid rgba(245,158,11,0.25)",marginBottom:"14px"}}>
              <Flame size={20} color="var(--cyber-amber)" />
              <div>
                <div style={{fontSize:"16px",fontWeight:800,color:"var(--cyber-amber)",fontFamily:"var(--font-mono)"}}>{streakDays} {streakDays === 1 ? 'Day' : 'Days'}</div>
                <div style={{fontSize:"10px",color:"var(--text-secondary)"}}>{streakDays > 0 ? 'ACTIVE STREAK • Tracking' : 'NO ACTIVE STREAK • Start Learning'}</div>
              </div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px",fontSize:"11px"}}>
            <div style={{padding:"8px",background:"var(--bg-input)",borderRadius:"6px",border:"1px solid var(--border-subtle)"}}>
              <div style={{color:"var(--text-muted)"}}>COMPLETED</div>
              <div style={{fontWeight:700,color:"var(--text-primary)",marginTop:"2px"}}>{completedCount} courses</div>
              <div style={{color:"var(--cyber-emerald)",fontSize:"10px"}}>{completedCount*2} Badges</div>
            </div>
            <div style={{padding:"8px",background:"var(--bg-input)",borderRadius:"6px",border:"1px solid var(--border-subtle)"}}>
              <div style={{color:"var(--text-muted)"}}>IN PROGRESS</div>
              <div style={{fontWeight:700,color:"var(--text-primary)",marginTop:"2px"}}>{inProgressCount} active</div>
              <div style={{color:"var(--cyber-cyan)",fontSize:"10px"}}>{enrollments.reduce((s,e)=>s+(e.completedModules||0),0)} modules</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:"24px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
            <h2 style={{fontSize:"16px",fontWeight:700,color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"8px"}}>
              <BookOpen size={16} color="var(--cyber-cyan)" /><span>Active Learning Tracks</span>
            </h2>
            <button onClick={()=>setActiveTab("My Enrolled Courses")} style={{background:"none",border:"none",fontSize:"11.5px",color:"var(--cyber-cyan)",cursor:"pointer"}}>View all →</button>
          </div>
          {enrollments.filter(e=>e.status==="active" || (e.progress > 0 && e.progress < 100)).length === 0 ? (
            <div className="glass-panel" style={{padding:"36px",textAlign:"center"}}>
              <BookOpen size={40} color="var(--text-muted)" style={{marginBottom:"12px"}} />
              <h3 style={{fontSize:"16px",fontWeight:700,color:"var(--text-primary)",marginBottom:"6px"}}>No Active Courses</h3>
              <p style={{color:"var(--text-muted)",fontSize:"13px",marginBottom:"18px"}}>
                You are not currently enrolled in any courses. Browse the Course Catalog to begin your learning journey.
              </p>
              <button onClick={()=>setActiveTab("Course Catalog")} className="btn-cyber-primary" style={{padding:"8px 18px",fontSize:"12px"}}>
                Browse Course Catalog →
              </button>
            </div>
          ) : (
            enrollments.filter(e=>e.status==="active" || (e.progress > 0 && e.progress < 100)).slice(0,3).map(course=>(
              <div key={course.enrollmentId || course.id} className="glass-panel" style={{padding:"22px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                      <span className="cyber-badge" style={{fontSize:"9px",background:`${catColor(course.category)}18`,color:catColor(course.category),border:`1px solid ${catColor(course.category)}40`}}>{course.category}</span>
                    </div>
                    <h3 style={{fontSize:"17px",fontWeight:700,color:"var(--text-primary)"}}>{course.courseTitle || course.title}</h3>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <span style={{fontSize:"20px",fontWeight:800,color:"var(--cyber-cyan)",fontFamily:"var(--font-mono)"}}>{course.progress}%</span>
                    <div style={{fontSize:"10.5px",color:"var(--text-muted)"}}>{course.completedModules || 0} of {course.totalModules || 12} modules</div>
                  </div>
                </div>
                <div style={{width:"100%",height:"6px",background:"rgba(255,255,255,0.06)",borderRadius:"3px",overflow:"hidden",marginBottom:"14px"}}>
                  <div style={{width:`${course.progress}%`,height:"100%",background:"var(--grad-cyan-blue)",borderRadius:"3px",transition:"width 0.4s"}} />
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"var(--bg-input)",borderRadius:"8px",border:"1px solid var(--border-subtle)"}}>
                  <div>
                    <span style={{fontSize:"10px",color:"var(--cyber-cyan)",fontFamily:"var(--font-mono)",textTransform:"uppercase"}}>NEXT UP</span>
                    <div style={{fontSize:"13px",fontWeight:600,color:"var(--text-primary)"}}>{course.currentModule || 'Module 1'}</div>
                  </div>
                  <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                    <button onClick={()=>onResume(course.enrollmentId || course.id)} className="btn-cyber-outline" style={{padding:"6px 12px",fontSize:"12px"}}>Continue →</button>
                    {onCompleteModule && <button onClick={()=>onCompleteModule(course.enrollmentId || course.id, course.currentModule || 'Module 1')} className="btn-cyber-primary" style={{padding:"6px 12px",fontSize:"12px"}}>Complete Module ✓</button>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
          <div className="glass-panel" style={{padding:"20px",borderColor:"rgba(139,92,246,0.3)"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",color:"var(--cyber-purple)",fontSize:"11.5px",fontWeight:700,textTransform:"uppercase",marginBottom:"8px",fontFamily:"var(--font-mono)"}}>
              <Sparkles size={14} /><span>TACTICAL ACCELERATION INSIGHT</span>
            </div>
            <p style={{fontSize:"12.5px",color:"var(--text-secondary)",lineHeight:1.5,marginBottom:"14px"}}>
              {enrollments.length > 0
                ? `"Nexus Insight: Advancing your enrolled coursework will close targeted skill gaps for high-match enterprise internships."`
                : `"Nexus Insight: Enroll in foundational or emerging tech courses to start building your verified capability profile."`}
            </p>
            <div style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"rgba(139,92,246,0.08)",borderRadius:"6px",border:"1px solid rgba(139,92,246,0.2)",marginBottom:"12px",fontSize:"11.5px"}}>
              <span style={{color:"var(--text-secondary)"}}>Career Match Lift:</span>
              <strong style={{color: overallPct > 0 ? "var(--cyber-emerald)" : "var(--text-muted)"}}>
                {overallPct > 0 ? `+${Math.round(overallPct * 0.25)}% Readiness` : "0.0% Readiness"}
              </strong>
            </div>
            <button onClick={()=>setActiveTab("Course Catalog")} className="btn-cyber-purple" style={{width:"100%",padding:"9px",fontSize:"12px"}}>Browse Course Catalog</button>
          </div>
          <div className="glass-panel" style={{padding:"20px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",color:"var(--cyber-cyan)",fontSize:"11.5px",fontWeight:700,textTransform:"uppercase",marginBottom:"8px",fontFamily:"var(--font-mono)"}}>
              <ShieldCheck size={14} /><span>EVIDENCE SYNC LEDGER</span>
            </div>
            <div style={{fontSize:"12px",color:"var(--text-secondary)",marginBottom:"14px"}}>Verified study hours are cryptographically attested to your Digital Passport.</div>
            {enrollments.length === 0 ? (
              <div style={{padding:"12px 10px",background:"rgba(255,255,255,0.02)",borderRadius:"6px",border:"1px solid var(--border-subtle)",fontSize:"11px",color:"var(--text-muted)",marginBottom:"6px",textAlign:"center"}}>
                No verified study hours recorded yet.
              </div>
            ) : (
              enrollments.slice(0,3).map(e=>(
                <div key={e.enrollmentId || e.id} style={{padding:"8px 10px",background:"rgba(255,255,255,0.02)",borderRadius:"6px",border:"1px solid var(--border-subtle)",fontSize:"11px",marginBottom:"6px"}}>
                  <div style={{fontWeight:600,color:"var(--text-primary)"}}>{e.courseTitle || e.title}</div>
                  <div style={{color:"var(--cyber-emerald)",fontSize:"10px"}}>+{(e.completedModules || 0)*2}h verified</div>
                </div>
              ))
            )}
            <button onClick={()=>setActiveTab("Certificates & Badges")} className="btn-cyber-outline" style={{width:"100%",padding:"8px",fontSize:"12px",marginTop:"8px"}}>View Credentials →</button>
          </div>
          <div style={{padding:"14px",borderRadius:"8px",background:"var(--bg-input)",border:"1px solid var(--border-subtle)",fontSize:"11px",color:"var(--text-muted)"}}>
            <strong style={{color:"var(--cyber-cyan)",display:"block",marginBottom:"4px"}}>NEXUS AI PROTOCOL</strong>
            {streakDays > 0 ? `${streakDays}-day streak preserves your candidate tier priority.` : 'Consistency over intensity: Complete your first module to activate candidate streak.'}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── My Enrolled Courses ─── */
function EnrolledCoursesPanel({ enrollments, onResume, onCompleteModule, onOpenSkillDetails }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? enrollments : enrollments.filter(e => e.status === filter);
  return (
    <div>
      <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
        {["all","active","completed"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?"rgba(0,212,255,0.10)":"transparent",border:filter===f?"1px solid rgba(0,212,255,0.35)":"1px solid transparent",color:filter===f?"var(--cyber-cyan)":"var(--text-secondary)",padding:"6px 16px",borderRadius:"20px",fontSize:"12.5px",fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>
            {f==="all"?`All (${enrollments.length})`:f==="active"?`In Progress (${enrollments.filter(e=>e.status==="active").length})`:`Completed (${enrollments.filter(e=>e.status==="completed").length})`}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{padding:"48px",textAlign:"center"}}>
          <BookOpen size={40} color="var(--text-muted)" style={{marginBottom:"12px"}} />
          <div style={{color:"var(--text-muted)",fontSize:"14px"}}>No courses found. Browse the Course Catalog to enroll.</div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          {filtered.map(course=>(
            <div key={course.enrollmentId} className="glass-panel" style={{padding:"22px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
                    <span className="cyber-badge" style={{fontSize:"9px",background:`${catColor(course.category)}18`,color:catColor(course.category),border:`1px solid ${catColor(course.category)}40`}}>{course.category}</span>
                    {course.status==="completed" && <span className="cyber-badge badge-emerald" style={{fontSize:"9px"}}>✓ COMPLETED</span>}
                  </div>
                  <h3 style={{fontSize:"17px",fontWeight:700,color:"var(--text-primary)",marginBottom:"4px"}}>{course.courseTitle}</h3>
                  <div style={{fontSize:"11px",color:"var(--text-muted)"}}>Enrolled {new Date(course.enrolledAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <span style={{fontSize:"22px",fontWeight:900,color:course.status==="completed"?"var(--cyber-emerald)":"var(--cyber-cyan)",fontFamily:"var(--font-mono)"}}>{course.progress}%</span>
                  <div style={{fontSize:"10.5px",color:"var(--text-muted)"}}>{course.completedModules}/{course.totalModules} modules</div>
                </div>
              </div>
              <div style={{width:"100%",height:"7px",background:"rgba(255,255,255,0.06)",borderRadius:"4px",overflow:"hidden",marginBottom:"14px"}}>
                <div style={{width:`${course.progress}%`,height:"100%",background:course.status==="completed"?"linear-gradient(90deg,#2FE0A1,#22c55e)":"var(--grad-cyan-blue)",borderRadius:"4px",transition:"width 0.4s"}} />
              </div>
              {course.status !== "completed" ? (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"var(--bg-input)",borderRadius:"8px",border:"1px solid var(--border-subtle)",flexWrap:"wrap",gap:"10px"}}>
                  <div>
                    <span style={{fontSize:"10px",color:"var(--cyber-cyan)",fontFamily:"var(--font-mono)",textTransform:"uppercase"}}>NEXT UP</span>
                    <div style={{fontSize:"13px",fontWeight:600,color:"var(--text-primary)"}}>{course.currentModule}</div>
                  </div>
                  <div style={{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontSize:"11px",color:"var(--text-muted)"}}>{course.hoursRemaining}h left</span>
                    <button onClick={()=>onResume(course.enrollmentId)} className="btn-cyber-outline" style={{padding:"6px 12px",fontSize:"12px"}}>Continue →</button>
                    {onCompleteModule && <button onClick={()=>onCompleteModule(course.enrollmentId, course.currentModule)} className="btn-cyber-primary" style={{padding:"6px 12px",fontSize:"12px"}}>Complete Module ✓</button>}
                    {onOpenSkillDetails && (
                      <button
                        onClick={() => onOpenSkillDetails(course.skillId || course.courseId)}
                        className="btn-cyber-outline"
                        style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", borderColor: "var(--cyber-purple)", color: "var(--cyber-purple)" }}
                      >
                        <Award size={13} />
                        <span>Assessment & Cert</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"12px",color:"var(--cyber-emerald)"}}>
                    <CheckCircle2 size={16} /><span>Course completed • Certificate issued to Digital Passport</span>
                  </div>
                  {onOpenSkillDetails && (
                    <button
                      onClick={() => onOpenSkillDetails(course.skillId || course.courseId)}
                      className="btn-cyber-outline"
                      style={{ padding: "5px 12px", fontSize: "11.5px", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <Award size={13} color="var(--cyber-emerald)" />
                      <span>View Credential</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Course Catalog ─── */
function CourseCatalogPanel({ collegeId, enrollments, onEnroll, onOpenSkillDetails }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("ALL");
  const [liveSkills, setLiveSkills] = useState([]);

  useEffect(() => {
    let mounted = true;
    learningService.getSkills().then(res => {
      if (res && res.success && Array.isArray(res.data) && mounted) {
        setLiveSkills(res.data);
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const directoryCatalog = getCoursesByCollegeId(collegeId) || [];
  const instCatalog = (getCoursesByInstitution(collegeId) || []).map(rc => ({
    courseId: rc.courseId,
    title: rc.courseName,
    category: rc.category || 'TECHNICAL',
    level: rc.difficulty || 'Intermediate',
    durationWeeks: rc.durationWeeks || 6,
    totalModules: (rc.modules && rc.modules.length) || 4,
    tags: Array.isArray(rc.skillsDeveloped) ? rc.skillsDeveloped : ['Engineering', 'Campus Credit'],
    description: rc.description
  }));

  const mappedLive = liveSkills.map(sk => ({
    courseId: sk.id,
    skillId: sk.id,
    title: sk.title,
    category: sk.category || 'TECHNICAL',
    level: sk.level || 'Intermediate',
    durationWeeks: sk.duration_weeks || 6,
    totalModules: Array.isArray(sk.modules) ? sk.modules.length : 4,
    tags: [sk.code || 'SKILL', sk.enrollment_type === 'APPROVAL_REQUIRED' ? 'Approval Required' : 'Open Enrollment'],
    description: sk.description,
    isSkillLifecycle: true,
    eligibility: sk.eligibility
  }));

  const catalog = [
    ...mappedLive,
    ...instCatalog.filter(ic => !mappedLive.some(ml => ml.courseId === ic.courseId)),
    ...directoryCatalog.filter(dc => !instCatalog.some(ic => ic.courseId === dc.courseId) && !mappedLive.some(ml => ml.courseId === dc.courseId))
  ];

  const enrolledIds = new Set(enrollments.map(e => e.courseId || e.skillId));
  const categories = ["ALL",...new Set(catalog.map(c => c.category))];
  const filtered = catalog.filter(c => {
    const ms = !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.tags && c.tags.some(t=>t.toLowerCase().includes(search.toLowerCase())));
    const mc = filterCat==="ALL" || c.category===filterCat;
    return ms && mc;
  });

  return (
    <div>
      <div style={{display:"flex",gap:"12px",marginBottom:"16px",flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:"1",minWidth:"200px"}}>
          <Search size={14} color="var(--text-muted)" style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)"}} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses, skills, tags..." style={{width:"100%",paddingLeft:"36px",paddingRight:"12px",paddingTop:"9px",paddingBottom:"9px",background:"var(--bg-input)",border:"1px solid var(--border-subtle)",borderRadius:"8px",color:"var(--text-primary)",fontSize:"13px",outline:"none",boxSizing:"border-box"}} />
        </div>
        <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
          {categories.slice(0,9).map(cat=>(
            <button key={cat} onClick={()=>setFilterCat(cat)} style={{background:filterCat===cat?"rgba(0,212,255,0.10)":"transparent",border:filterCat===cat?"1px solid rgba(0,212,255,0.35)":"1px solid var(--border-subtle)",color:filterCat===cat?"var(--cyber-cyan)":"var(--text-secondary)",padding:"5px 12px",borderRadius:"20px",fontSize:"11px",fontWeight:600,cursor:"pointer",transition:"all 0.15s"}}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div style={{fontSize:"11px",color:"var(--text-muted)",marginBottom:"16px",fontFamily:"var(--font-mono)"}}>{filtered.length} COURSES AVAILABLE • CAMPUS & NEXUS PLATFORM CATALOG</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"16px"}}>
        {filtered.map(course=>{
          const isEnrolled = enrolledIds.has(course.courseId) || enrolledIds.has(course.skillId);
          const cc = catColor(course.category);
          const isEligible = course.eligibility?.isEligible;

          return (
            <div key={course.courseId} className="glass-panel" style={{padding:"20px",borderTop:`3px solid ${cc}`,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px",flexWrap:"wrap",gap:"6px"}}>
                  <span className="cyber-badge" style={{fontSize:"9px",background:`${cc}18`,color:cc,border:`1px solid ${cc}40`}}>{course.category}</span>
                  <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                    {course.isSkillLifecycle && (
                      <span className={`cyber-badge ${isEligible ? 'badge-emerald' : 'badge-amber'}`} style={{fontSize:"9px"}}>
                        {isEligible ? '✓ ELIGIBLE' : 'CRITERIA CHECK'}
                      </span>
                    )}
                    {isEnrolled && <span className="cyber-badge badge-emerald" style={{fontSize:"9px"}}>✓ ENROLLED</span>}
                  </div>
                </div>
                <h3 style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)",marginBottom:"6px"}}>{course.title}</h3>
                <div style={{fontSize:"11.5px",color:"var(--text-secondary)",marginBottom:"10px"}}>{course.level} • {course.durationWeeks} weeks • {course.totalModules} modules</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"14px"}}>
                  {(course.tags || []).slice(0,4).map(t=>(
                    <span key={t} style={{fontSize:"10px",padding:"2px 7px",borderRadius:"4px",background:"rgba(255,255,255,0.04)",border:"1px solid var(--border-subtle)",color:"var(--text-muted)"}}>{t}</span>
                  ))}
                </div>
              </div>

              <div style={{display:"flex",gap:"8px",marginTop:"10px"}}>
                {course.isSkillLifecycle ? (
                  <button
                    onClick={() => onOpenSkillDetails && onOpenSkillDetails(course.skillId || course.courseId)}
                    className="btn-cyber-primary"
                    style={{width:"100%",padding:"8px",fontSize:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}
                  >
                    <Sparkles size={13} />
                    <span>{isEnrolled ? "View Course & Progress" : "Check Eligibility & Enroll"}</span>
                  </button>
                ) : (
                  <button
                    onClick={()=>!isEnrolled&&onEnroll(course)}
                    disabled={isEnrolled}
                    className={isEnrolled?"btn-cyber-outline":"btn-cyber-primary"}
                    style={{width:"100%",padding:"8px",fontSize:"12px",opacity:isEnrolled?0.6:1,cursor:isEnrolled?"not-allowed":"pointer"}}
                  >
                    {isEnrolled ? "✓ Already Enrolled" : "Enroll Now"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Skill Growth & Analytics ─── */
function SkillAnalyticsPanel({ enrollments = [] }) {
  const overallPct = enrollments.length > 0 ? Math.round(enrollments.reduce((s,e) => s + (Number(e.progress) || 0), 0) / enrollments.length) : 0;
  const completedCount = enrollments.filter(e => e.status === "completed" || e.progress >= 100).length;
  const totalHours = enrollments.reduce((s, e) => s + (Number(e.completedModules) || 0) * 2, 0);
  const streakDays = totalHours > 0 ? 1 : 0;

  // Genuine skill breakdown from enrolled courses
  const categoryMap = {};
  enrollments.forEach(e => {
    const cat = e.category || 'General';
    if (!categoryMap[cat]) categoryMap[cat] = { totalProg: 0, count: 0 };
    categoryMap[cat].totalProg += (Number(e.progress) || 0);
    categoryMap[cat].count += 1;
  });

  const skillGrowth = Object.entries(categoryMap).map(([cat, val]) => ({
    skill: cat,
    before: 0,
    after: Math.round(val.totalProg / val.count),
    color: catColor(cat)
  }));

  const monthlyCompletion = [
    { month: "Jun", pct: totalHours > 20 ? 15 : 0 },
    { month: "Jul", pct: totalHours > 40 ? 30 : 0 },
    { month: "Aug", pct: totalHours > 60 ? 50 : 0 },
    { month: "Sep", pct: overallPct }
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"28px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"16px"}}>
        {[
          {label:"OVERALL MASTERY",value:`${overallPct}%`,color:"var(--cyber-cyan)"},
          {label:"TOTAL ENROLLED",value:enrollments.length,color:"var(--text-primary)"},
          {label:"COMPLETED",value:completedCount,color:"var(--cyber-emerald)"},
          {label:"LEARNING STREAK",value:`${streakDays}d`,color:"var(--cyber-amber)"},
          {label:"TOTAL HOURS",value:`${totalHours}h`,color:"var(--cyber-purple)"},
        ].map((stat,i)=>(
          <div key={i} className="glass-panel" style={{padding:"18px"}}>
            <div style={{fontSize:"9.5px",color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginBottom:"6px"}}>{stat.label}</div>
            <div style={{fontSize:"26px",fontWeight:800,color:stat.color,fontFamily:"var(--font-mono)",lineHeight:1}}>{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="glass-panel" style={{padding:"24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"20px"}}>
          <TrendingUp size={16} color="var(--cyber-cyan)" />
          <h3 style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)"}}>Skill Growth Delta</h3>
          <span className="cyber-badge badge-cyan" style={{fontSize:"9px",marginLeft:"auto"}}>Activity-Based</span>
        </div>
        {skillGrowth.length === 0 ? (
          <div style={{padding:"24px",textAlign:"center",color:"var(--text-muted)"}}>
            <p style={{margin:0,fontSize:"13px"}}>No skill growth delta recorded yet.</p>
            <p style={{margin:"6px 0 0",fontSize:"11px"}}>Complete course modules and skill assessments to track verifiable skill progression.</p>
          </div>
        ) : (
          skillGrowth.map(sg=>(
            <div key={sg.skill} style={{marginBottom:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                <span style={{fontSize:"13px",fontWeight:600,color:"var(--text-primary)"}}>{sg.skill}</span>
                <span style={{fontSize:"12px",color:"var(--cyber-emerald)",fontFamily:"var(--font-mono)",fontWeight:700}}>+{sg.after-sg.before}%</span>
              </div>
              <div style={{position:"relative",height:"12px",background:"rgba(255,255,255,0.04)",borderRadius:"6px",overflow:"hidden",marginBottom:"4px"}}>
                <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${sg.before}%`,background:"rgba(255,255,255,0.08)",borderRadius:"6px"}} />
                <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${sg.after}%`,background:`linear-gradient(90deg,${sg.color}80,${sg.color})`,borderRadius:"6px",boxShadow:`0 0 8px ${sg.color}60`,transition:"width 0.5s"}} />
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"10px",color:"var(--text-muted)"}}>
                <span>Initial: {sg.before}%</span><span>Current: {sg.after}%</span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="glass-panel" style={{padding:"24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"20px"}}>
          <Activity size={16} color="var(--cyber-purple)" />
          <h3 style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)"}}>Per-Course Progress</h3>
        </div>
        {enrollments.length === 0 ? (
          <div style={{padding:"24px",textAlign:"center",color:"var(--text-muted)"}}>
            <p style={{margin:0,fontSize:"13px"}}>No enrolled courses to report progress.</p>
          </div>
        ) : (
          enrollments.map(e=>{
            const cc=catColor(e.category);
            return (
              <div key={e.enrollmentId || e.id} style={{marginBottom:"16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontSize:"10px",padding:"2px 7px",borderRadius:"4px",background:`${cc}18`,color:cc,border:`1px solid ${cc}40`,fontWeight:700}}>{e.category}</span>
                    <span style={{fontSize:"13px",fontWeight:600,color:"var(--text-primary)"}}>{e.courseTitle || e.title}</span>
                  </div>
                  <span style={{fontSize:"15px",fontWeight:800,color:cc,fontFamily:"var(--font-mono)"}}>{e.progress || 0}%</span>
                </div>
                <div style={{width:"100%",height:"7px",background:"rgba(255,255,255,0.06)",borderRadius:"4px",overflow:"hidden"}}>
                  <div style={{width:`${e.progress || 0}%`,height:"100%",background:`linear-gradient(90deg,${cc},${cc}99)`,borderRadius:"4px",transition:"width 0.5s",boxShadow:`0 0 8px ${cc}50`}} />
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:"4px",fontSize:"10.5px",color:"var(--text-muted)"}}>
                  <span>{(e.completedModules || 0)*2}h spent</span><span>{e.status==="completed" || e.progress >= 100 ?"✓ Complete":"In Progress"}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="glass-panel" style={{padding:"24px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"20px"}}>
          <BarChart3 size={16} color="var(--cyber-emerald)" />
          <h3 style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)"}}>Monthly Completion Trend</h3>
        </div>
        <div style={{display:"flex",alignItems:"flex-end",gap:"16px",height:"100px",padding:"0 8px",borderBottom:"1px solid var(--border-subtle)",marginBottom:"8px"}}>
          {monthlyCompletion.map((m,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",height:"100%",justifyContent:"flex-end"}}>
              <span style={{fontSize:"10px",color:"var(--cyber-emerald)",fontFamily:"var(--font-mono)"}}>{m.pct}%</span>
              <div style={{width:"100%",height:`${m.pct}%`,background:"linear-gradient(180deg,#2FE0A1 0%,#0D9488 100%)",borderRadius:"4px 4px 0 0",boxShadow:"0 0 8px rgba(47,224,161,0.4)",transition:"height 0.5s"}} />
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:"16px",paddingLeft:"8px"}}>
          {monthlyCompletion.map((m,i)=><span key={i} style={{flex:1,textAlign:"center",fontSize:"10px",color:"var(--text-muted)"}}>{m.month}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ─── Certificates & Badges ─── */
function CredentialsPanel({ credentials = [], enrollments = [], onShowToast }) {
  const allCreds = credentials || [];
  const completedCourses = enrollments.filter(e => e.status === "completed" || e.progress === 100).length;
  const seals = allCreds.filter(c => c.hasSeal || c.type === "Seal" || c.badgeType);

  const dl = (cred) => { if(onShowToast) onShowToast({title:"Certificate Export",message:`${cred.courseTitle || cred.title || "Certificate"} — PDF queued.`,type:"success"}); };
  const share = (cred) => { 
    const id = cred.credentialId || cred.id || "NX-CERT";
    navigator.clipboard?.writeText(id); 
    if(onShowToast) onShowToast({title:"Credential ID Copied",message:`${id} copied.`,type:"info"}); 
  };

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:"14px",marginBottom:"28px"}}>
        {[
          {label:"CERTIFICATES EARNED",value:allCreds.length,color:"var(--cyber-cyan)"},
          {label:"COURSES COMPLETED",value:completedCourses,color:"var(--cyber-emerald)"},
          {label:"VERIFIED TO PASSPORT",value:allCreds.length,color:"var(--cyber-purple)"},
          {label:"INDUSTRY SEALS",value:seals.length,color:"var(--cyber-amber)"},
        ].map((s,i)=>(
          <div key={i} className="glass-panel" style={{padding:"18px"}}>
            <div style={{fontSize:"9.5px",color:"var(--text-muted)",fontFamily:"var(--font-mono)",marginBottom:"6px"}}>{s.label}</div>
            <div style={{fontSize:"28px",fontWeight:900,color:s.color,fontFamily:"var(--font-mono)",lineHeight:1}}>{s.value}</div>
          </div>
        ))}
      </div>
      <h3 style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px"}}>
        <Award size={16} color="var(--cyber-cyan)" /> Earned Certificates
      </h3>
      {allCreds.length > 0 ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"14px",marginBottom:"28px"}}>
          {allCreds.map(cred=>{
            const cc=catColor(cred.category);
            return (
              <div key={cred.credentialId || cred.id} className="glass-panel" style={{padding:"20px",borderLeft:`3px solid ${cc}`,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:"12px",right:"14px",fontSize:"9px",color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>{cred.credentialId || cred.id}</div>
                <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
                  <div style={{width:"38px",height:"38px",borderRadius:"50%",background:`${cc}18`,border:`2px solid ${cc}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Award size={18} color={cc} />
                  </div>
                  <div>
                    <div style={{fontSize:"14px",fontWeight:700,color:"var(--text-primary)"}}>{cred.courseTitle || cred.title}</div>
                    <div style={{fontSize:"11px",color:"var(--text-secondary)"}}>{cred.level||`${cred.type || "Certificate"} • ${cred.category || "General"}`}</div>
                  </div>
                </div>
                <div style={{fontSize:"10.5px",color:"var(--text-muted)",marginBottom:"12px"}}>Issued: {cred.issuedAt ? new Date(cred.issuedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "Recently"}</div>
                <div style={{display:"flex",gap:"8px"}}>
                  <button onClick={()=>dl(cred)} className="btn-cyber-outline" style={{flex:1,padding:"7px",fontSize:"11px",display:"flex",alignItems:"center",justifyContent:"center",gap:"4px"}}>
                    <Download size={12} /><span>Download PDF</span>
                  </button>
                  <button onClick={()=>share(cred)} className="btn-cyber-outline" style={{flex:1,padding:"7px",fontSize:"11px",display:"flex",alignItems:"center",justifyContent:"center",gap:"4px"}}>
                    <ExternalLink size={12} /><span>Share</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel" style={{padding:"32px",textAlign:"center",color:"var(--text-muted)",marginBottom:"28px"}}>
          <p style={{margin:0,fontSize:"13px"}}>No certificates earned yet.</p>
          <p style={{margin:"6px 0 0",fontSize:"11px"}}>Complete 100% of your course modules and assessments to receive official verified credentials.</p>
        </div>
      )}
      <h3 style={{fontSize:"15px",fontWeight:700,color:"var(--text-primary)",display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px"}}>
        <ShieldCheck size={16} color="var(--cyber-amber)" /> Industry Seals & Proctor Badges
      </h3>
      {seals.length > 0 ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:"14px"}}>
          {seals.map((seal,i)=>(
            <div key={i} className="glass-panel" style={{padding:"20px",borderTop:`3px solid ${seal.color || "var(--cyber-amber)"}`}}>
              <span style={{fontSize:"9px",padding:"2px 8px",borderRadius:"4px",background:`${seal.color || "var(--cyber-amber)"}18`,color:seal.color || "var(--cyber-amber)",border:`1px solid ${seal.color || "var(--cyber-amber)"}40`,fontWeight:700,fontFamily:"var(--font-mono)",display:"inline-block",marginBottom:"8px"}}>{seal.type || "SEAL"}</span>
              <div style={{fontSize:"14px",fontWeight:700,color:"var(--text-primary)",marginBottom:"4px"}}>{seal.title}</div>
              <div style={{fontSize:"11.5px",color:"var(--text-secondary)",marginBottom:"8px"}}>{seal.partner}</div>
              <div style={{fontSize:"10px",color:"var(--text-muted)",fontFamily:"var(--font-mono)"}}>{seal.code}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{padding:"28px",textAlign:"center",color:"var(--text-muted)"}}>
          <p style={{margin:0,fontSize:"13px"}}>No industry seals or proctor badges awarded yet.</p>
          <p style={{margin:"6px 0 0",fontSize:"11px"}}>Seals are awarded upon completing high-stakes proctored evaluations and industry-partnered capstones.</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════ ROOT ═══════════════════════════ */
export default function MyLearning({ setActivePage, onShowToast, user }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [enrollments, setEnrollments] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [modalSkillId, setModalSkillId] = useState(null);

  const auth = user || getStudentAuth();
  const studentId = auth?.studentId || auth?.id || auth?.email || "";
  const email = auth?.email || "";
  const collegeId = auth?.collegeId || auth?.institutionId || "TN010";

  const refreshData = useCallback(async () => {
    // 1. Get from localStorage
    const localEnrollments = studentId ? (getEnrollments(studentId) || []) : [];
    const localCredentials = studentId ? (getCredentials(studentId) || []) : [];

    // 2. Fetch from backend GET /api/learning
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '') + '/api';
    try {
      const res = await fetch(`${apiBase}/learning`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const backendEnrollments = json.data.enrollments || [];
          const map = new Map();
          localEnrollments.forEach(e => map.set(e.courseId || e.id || e.enrollmentId, e));
          backendEnrollments.forEach(e => map.set(e.courseId || e.id || e.enrollmentId, {
            ...e,
            enrollmentId: e.id || e.enrollmentId,
            courseTitle: e.courseTitle || e.title,
            progress: e.progress ?? 0,
            completedModules: e.completedModules ?? (e.completedModuleIds?.length || 0),
            totalModules: e.totalModules || 12,
            status: e.status || (e.progress >= 100 ? 'completed' : 'active')
          }));
          setEnrollments(Array.from(map.values()));
          setCredentials(localCredentials);
          return;
        }
      }
    } catch (err) {
      console.debug('Backend learning sync fallback:', err);
    }
    setEnrollments(localEnrollments);
    setCredentials(localCredentials);
  }, [studentId]);

  useEffect(() => {
    refreshData();
    const h = () => refreshData();
    window.addEventListener("nexus_enrollment_updated", h);
    window.addEventListener("nexus_credential_issued", h);
    window.addEventListener("nexus_course_created", h);
    window.addEventListener("nexus_data_updated", h);
    return () => {
      window.removeEventListener("nexus_enrollment_updated", h);
      window.removeEventListener("nexus_credential_issued", h);
      window.removeEventListener("nexus_course_created", h);
      window.removeEventListener("nexus_data_updated", h);
    };
  }, [refreshData]);

  // "Continue" only fetches resume context / opens study session — NO progress mutation
  const handleResume = async (enrollmentId) => {
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '') + '/api';
    try {
      const res = await fetch(`${apiBase}/learning/${encodeURIComponent(enrollmentId)}/resume`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const json = await res.json();
        const currentMod = json.data?.currentModule || 'Module 1';
        if (onShowToast) {
          onShowToast({
            title: "Study Session Active",
            message: `Resume ${currentMod}. Work through lesson materials before submitting completion.`,
            type: "info"
          });
        }
        return;
      }
    } catch (err) {
      console.debug('Backend resume check deferred:', err);
    }
    if (onShowToast) {
      onShowToast({
        title: "Study Session Active",
        message: "Work through lesson materials, then click Complete Module to advance.",
        type: "info"
      });
    }
  };

  // Explicit, idempotent module completion
  const handleCompleteModule = async (enrollmentId, moduleName) => {
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '') + '/api';
    const enr = enrollments.find(e => e.enrollmentId === enrollmentId || e.id === enrollmentId);
    const modId = enr ? `mod_${(enr.completedModules || 0) + 1}` : `mod_${Date.now()}`;

    try {
      const res = await fetch(`${apiBase}/learning/${encodeURIComponent(enrollmentId)}/modules/${encodeURIComponent(modId)}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (res.ok) {
        const json = await res.json();
        advanceStudentCourseModule(enrollmentId);
        advanceModule(enrollmentId);
        refreshData();
        if (onShowToast) {
          const pct = json.data?.progress ?? json.data?.completionPercentage ?? 100;
          if (pct >= 100) {
            onShowToast({ title: "🎓 Course Completed!", message: "100% finished! Certificate issued to your Digital Passport.", type: "success" });
          } else {
            onShowToast({ title: "Module Completed", message: `Progress updated: ${pct}% (${json.data?.completedModules || 1}/${json.data?.totalModules || 8} modules).`, type: "success" });
          }
        }
        return;
      }
    } catch (err) {
      console.debug('Backend module complete sync deferred:', err);
    }

    advanceStudentCourseModule(enrollmentId);
    const updated = advanceModule(enrollmentId);
    if (updated) {
      refreshData();
      if (onShowToast) {
        if (updated.status === "completed") {
          onShowToast({title:"🎓 Course Completed!",message:"Certificate issued to your Digital Passport. Verified skills elevated.",type:"success"});
        } else {
          onShowToast({title:"Module Completed",message:`Module progress: ${updated.progress}%. Telemetry committed.`,type:"success"});
        }
      }
    }
  };

  const handleEnroll = (course) => {
    const studentObj = getRelationalStudentById(studentId) || { studentId, name: auth?.name || "Student", collegeId };
    enrollStudentInCourse(studentObj, course);
    const result = enrollCourse(studentId, email, {...course, collegeId});
    if (result.ok) {
      refreshData();
      if (onShowToast) onShowToast({title:"Enrolled!",message:`You are now enrolled in "${course.title}". Module 1 unlocked.`,type:"success"});
    } else if (result.reason === "already_enrolled") {
      if (onShowToast) onShowToast({title:"Already Enrolled",message:`You are already enrolled in "${course.title}".`,type:"info"});
    }
  };

  return (
    <div>
      <div className="page-top-telemetry">
        <div className="page-title-group">
          <div className="telemetry-node-tag">
            <span>TELEMETRY SYNCED</span><span>//</span><span>Session: Q2 Spring Cohort</span>
          </div>
          <h1>My Learning</h1>
          <p>Turn skill gaps into verified technical velocity and digital passport proof.</p>
        </div>
        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={()=>setActivePage("settings")} className="btn-cyber-outline">Curriculum Preferences</button>
          <button onClick={()=>{const a=enrollments.find(e=>e.status==="active");if(a)handleResume(a.enrollmentId);}} className="btn-cyber-primary">
            <Play size={14} fill="#060B14" /><span>Resume Study</span>
          </button>
        </div>
      </div>
      <div style={{display:"flex",gap:"4px",borderBottom:"1px solid var(--border-subtle)",marginBottom:"28px",flexWrap:"wrap"}}>
        {TABS.map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} style={{background:"none",border:"none",padding:"8px 16px",borderBottom:activeTab===tab?"2px solid var(--cyber-cyan)":"2px solid transparent",marginBottom:"-1px",fontSize:"13px",fontWeight:600,cursor:"pointer",color:activeTab===tab?"var(--cyber-cyan)":"var(--text-secondary)",transition:"all 0.15s",whiteSpace:"nowrap"}}>
            {tab}
          </button>
        ))}
      </div>
      {activeTab==="Overview" && <OverviewPanel enrollments={enrollments} onResume={handleResume} onCompleteModule={handleCompleteModule} setActiveTab={setActiveTab} user={auth} />}
      {activeTab==="My Enrolled Courses" && <EnrolledCoursesPanel enrollments={enrollments} onResume={handleResume} onCompleteModule={handleCompleteModule} onOpenSkillDetails={(id) => setModalSkillId(id)} />}
      {activeTab==="Course Catalog" && <CourseCatalogPanel collegeId={collegeId} enrollments={enrollments} onEnroll={handleEnroll} onOpenSkillDetails={(id) => setModalSkillId(id)} />}
      {activeTab==="Skill Growth & Analytics" && <SkillAnalyticsPanel enrollments={enrollments} />}
      {activeTab==="Certificates & Badges" && <CredentialsPanel credentials={credentials} enrollments={enrollments} onShowToast={onShowToast} />}

      {/* ── SKILL DETAILS & ELIGIBILITY MODAL ── */}
      {modalSkillId && (
        <SkillDetailsModal
          isOpen={Boolean(modalSkillId)}
          skillId={modalSkillId}
          student={auth}
          onClose={() => setModalSkillId(null)}
          onEnrolled={() => {
            refreshData();
            if (onShowToast) {
              onShowToast({
                title: "Enrollment Updated",
                message: "Enrolled in skill course. Progress tracking active.",
                type: "success"
              });
            }
          }}
        />
      )}
    </div>
  );
}
