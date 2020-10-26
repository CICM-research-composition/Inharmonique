// 
// =============================================================
//		Inharmonique - javascript code
// =============================================================
//
//	Jean-Claude Risset, INHARMONIQUE (1977) - 
//
//	Max / Javascript patch
// 
// 	Resynthesis version by 
// 		Antonio de Sousa Dias (a.sousadias@belasartes.ulisboa.pt)
//		José Luís Ferreira 
// last revision 24.06.2019
 
/***************************************************************
This programm implements both PLF routines and Event processing
in two main parts:
- The mannagement of event inputs, specially for NOT and PLF, opcodes 'i' and 'plf'
- The processing of PLF routines in to parts
	- PLF part and 
	- NOT processing part

This programm is based upon Lorrain (1980), Risset ([1969] 1995) and in the listing of the
PLF routines provided by Risset to Sousa Dias (Risset 1977).

 REFERENCES:
 Ferreira, J. L. (2016). Música Mista e Sistemas de Relações Dinâmicas [Doctoral Dissertation] Universidade Católica Portuguesa, Porto, pp148-157. http://hdl.handle.net/10400.14/24086
 Lorrain, D. (1980) Analyse de la bande magnétique de l'oeuvre de Jean-Claude Risset "Inharmonique". Rapport IRCAM n°26/80. Centre Georges Pompidou, Paris.
 Mathews, M. V. et al. (1969). The Technology of Computer Music. The MIT press, Cambridge.
 Risset, J.-C. ([1969] 1995) An introductory catalog of computer-synthesized sounds (1969). The historical CD of digital sound synthesis, CD Wergo 2033-2, 109-254.
 Risset, J.-C. (1977) Subroutine PLF. Fortran V.5(515) 4-JUL-77 18:10. [Fortran Listing sent by the author to António de Sousa Dias.]
 Risset, J.-C., Arfib, D., de Sousa Dias, A., Lorrain, D. Pottier, L. (2002) De "Inharmonique" à "Resonant Sound Spaces" : temps réel et mise en espace. Actes des neuvièmes Journées d’Informatique Musicale. AFIM/GMEM, 83-88. http://jim.afim-asso.org/jim2002/articles/L10_Risset.pdf
 Sousa Dias, A. (2003) Transcription de fichiers Music V vers Csound au travers de OpenMusic. Actes des dixièmes Journées d’Informatique Musicale, AFIM, Montbeliard.
 Sousa Dias, A. (2007). Deux contributions à la pédagogie de la musique électroacoustique et l’informatique musicale. Actes des Journées d’Informatique Musicale. AFIM/GRAME, Lyon.  http://www.grame.fr/jim07/download/11-SousaDias.pdf.
 Sousa Dias, A.; Ferreira, J. L. (2013). Jean-Claude Risset’s "Inharmonique" (1977): recast and a real time version proposal. EMS13: Electroacoustic Music in the context of interactive approaches and networks. Lisboa. http://www.ems-network.org/ems13/EMS13Abstracts.html
****************************************************************/

// =============================================================
//                inlets and outlets 
// =============================================================
inlets = 1 ;
outlets = 1 ;
// ============= set up inlets/outlets/assist strings
setinletassist(0,"messages to object");
setoutletassist(0,"output general messages");
// =============================================================
//                global variables and arrays 
// =============================================================
autowatch = 1;

// patch variables for coll communication
var p = this.patcher;
var js_coll = p.getnamed("coll2js"); // coll object containing structures

// subroutines and methods definition
var plfRoutine = new Array;
	plfRoutine.newRoutine = newRoutine;
	for( var i = 0; i <7; i++) plfRoutine.newRoutine( i, 0, 0);

// Storage of current plf command card
var plf_p = new Array;
// Current PLF invoked routine
var plfCorr = 0;
// Current PLF data load
var plfLoad = 0;

var structure = new Object();
    // methods for PLF5
	structure.struct_plf5 = struct_plf5;
	// methods for PLF6 struct
	structure.struct_plf6 = struct_plf6;
	structure.struct_plf6_comp = struct_plf6_comp;
	
var iverbose = 0; // show information

// =============================================================
//                Functions start here 
// =============================================================
// =============================================================
function loadbang(  ) {
// =============================================================

	init();

}
// =============================================================
function init(  ) {
// =============================================================
	// load SV1 data into this object through the method
	// loadPLFdata()
	js_coll.message("dump");
}

// The next two functions are equivalent: the csound object
// recognizes both "event" or "e" lists
// =============================================================
function event(  ) {
// =============================================================
	var ar_args = arrayfromargs( arguments );
	eventProcess( ar_args );
}
// =============================================================
function e(  ) {
// =============================================================
	var ar_args = arrayfromargs( arguments );
	eventProcess( ar_args );
}

// =============================================================
function verbose( i ) {
// =============================================================
	iverbose = i;
}

// =============================================================
// The Core event process function
// =============================================================
function eventProcess(  ) {
// =============================================================
	// Set the array ar_args to "event" list
	var ar_args = new Array;	
	// Fill 'ar_args' with input parameters
	for(var i in arguments[ 0 ] ) ar_args[ i ] = arguments[ 0 ][ i ];
		
	switch( ar_args[ 0 ] ) { // event type
        case "i":
            //
            if( plfRoutine[ plfCorr ].active > 0 ) {
                // if there is a PLF routine active
                // process "i" event accordingly
                plfProcess( plfCorr, ar_args );
                plfRoutine[ plfCorr ].active--;
            } else {
                // don't remember...
                if( ar_args[ 3 ] != 0 ) {
                    // Output event 'i' directly
                    outlet(0, "toCsound", "event", ar_args )
                } else {
                        // if ar_args[ 3 ] == 0 then p3=2 - ??
                        var ar_args2 = ar_args;
                        ar_args2[ 3 ] = 2;
                        outlet(0, "toCsound", "event", ar_args2 )
                }
            }
            break;

		case "plf":
			// load plf card
			plfCorr = ar_args[ 1 ]; // Set plfCorr to current PLF
			
			// Set PLF card to array plf_p[]
			plf_p = new Array;
			for( var i in ar_args ) plf_p[ i ] = ar_args[ i ];
			
			// Init PLF parameters
			switch(  plfCorr ) {
				case 1:
				case 2:
				case 3:
				case 4:
				case 7:
					plfRoutine.newRoutine( ar_args[ 1 ], ar_args[ 3 ], 0);
					break;
				
				case 5:
					// num_plf, num_events, num_struct
					if(iverbose != 0) post("case 5 : <",ar_args[ 1 ],"> <", ar_args[ 3 ],"> <", ar_args[ 4 ],">.\n");
					plfRoutine.newRoutine( ar_args[ 1 ], ar_args[ 3 ], ar_args[ 4 ]);
					break;

					
				case 6:
					// num_plf, num_events, num_struct
					plfRoutine.newRoutine( ar_args[ 1 ], ar_args[ 3 ], ar_args[ 4 ]);
					break;
                
				default:
					post("ERROR in function 'eventProcess': unknown PLF "+plfCorr+".\n");
					break;				
			};		
			break;
	
	
	
			default:
			// bypass all other events
			outlet(0, "toCsound", "event", ar_args );
			break;		
	}
}

// =============================================================
function anything(  ) {
// =============================================================
	var ar_args = arrayfromargs( arguments );
	for( var i in ar_args)
	post( "Anything > [",i,"]=  <",ar_args[ i ],">\n");
}

// =============================================================
function plfProcess( i, icmmand ) {
// =============================================================
	// This is the main routine to process NOT cards according to
    // current PLF
	var ar_args = arrayfromargs( arguments );
    
    // initialization of the NOT card to be processed
	var i_p = new Array;
	for( var i in ar_args[ 1 ] ) i_p[ i ] = ar_args[ 1 ][ i ];
	
	// NOTE:  parameters base 0 (MusicV was base 1)
	// Hence, p1 MusicV <=> p0 Csound
	
    // PLF Card - array plf_p[ ]
    // NOT Card - array i_p[ ]
	switch( ar_args[ 0 ] ) { // plf number
		case 1: // PLF 1
						
			/* [Original comments: lines 00020 to 00029]
            PLF FOR OVERTONES LB1 MAY 76
			PLF 0 1 NC N TS DD FR F1 F2 F3
			NC  NUMBER OF FOLLOWING NOTE CARDS ON WICH PLF APPLIES
			N   NB OF 3 NOTE CHORDS PRODUCED FROM EACH NOTE CARD
			TS  TIME SEPARATION BETWEEN SUCCESSIVE CHORDS
			DD  DURATION DIMINUTION FROM ONE CHORD TO THE NEXT
			FE  FREQUENCY RATIO FROM ONE NOTE TO THE NEXT
			F1 F2 F3   FREQUENCIES OF ONE TRANSPOSITION OF THE DESIRED
			CHORD. ANY TRANSPOSITION WILL DO.
			*/
			
			// Set PLF variables from parameters
			var iNC = plf_p[ 3 ]; // original : NC = P(4)
			var iN = plf_p[ 4 ];  //            N = P(5) etc.
			var iTS = plf_p[ 5 ]; // 			 etc.
			var iDD = plf_p[ 6 ];
			var iFR = plf_p[ 7 ]; 
			var iF1 = plf_p[ 9 ] / plf_p[ 8 ]; 
			var iF2 = plf_p[ 10 ] / plf_p[ 8 ]; 

			// Produce inote commands
			var iF0 = i_p[ 5 ];
			for(var j = 1; j<= iN; j++) {
				i_p[ 5 ] = iF0; // original P(4), etc.
				outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ]);
				//
				i_p[ 5 ] = iF0 * iF1; // original P(4), etc.
				outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ]);
				//
				i_p[ 5 ] = iF0 * iF2; // original P(4), etc.
				outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ]);
				iF0 = iF0 * iFR;
				i_p[ 3 ] = i_p[ 3 ] - iDD;
				i_p[ 1 ] = i_p[ 1 ] + iTS;
			};			
			break;
		
		
		case 4:
			/************************************************
			// Description in Lorrain 1980, p23 & p59
			
			P(4) - "nombre de NOT"
			P(5) - "X = nombre d'harm. par NOT"
			P(6) - "unité de temps"
			P(7) - "gain par harm."
			P(8) - "décr. de durée"
			P( 9 ... 9+(X-1) ) - "X numéros d'armoniques"
			P( 9+X ... (9+2*X-1) ) - "X incréments de temps d'attaque (par unités de temps)"			
			************************************************/

			/************************************************
			[Original comments: lines 00082 to 00092]
			****** PLF 4 for overtones dvpt cf dialogues luminy *******
			USES LOCATIONS D(1965) TO D(2000)
			CALL: PLF 0 4 NC N UNIT INT DURD FREQUFACTORS(10) ACTIME INCRTS (10)
			
			NC   NUMBER OF NOTE CARDS TO BE OPERATED ON
			N    NB OF COMPONENTS DVLPD FOR EACH CARD -SUBHARMONIC IF NEGATIVE
			UNIT TIME UNIT IN S FOR ACTION TIME INCRTS
			INT  MULTIPLIC INTENSITY FACTOR ROM 1 COMPONENT TO NEXT
			DURD DURATION DECREMENT FROM 1 COMPONENT TO NEXT
			10 FIELDS FOR UP TO 10 FREQU MULTIPLIERS
			10 FIELDS FOR UP TO TO ACTION TIME INCREMENTS			
						
			************************************************/
			var iIC = 0;
			var iNC = 1;
			var iISUB = 0 ; // D[2000] - value representing a flag <= 0 do code
			var iD = new Array(); //
			
			if( iISUB <= 0 ) {
				iNC = plf_p[ 3 ]; // original : NC = P(4)
				iN = plf_p[ 4 ];  // original :  N = P(5) etc.
				iFLAG = 1;
				if( iN <0 ) {
					iN = -iN;
					iFLAG = -iFLAG;				
				};
				iD1965 = iFLAG; // D[1965] = iFLAG
				iD1966 = iN;				
				//
				iD1967 = plf_p[ 5 ];
				iD1968 = plf_p[ 6 ];
				iD1969 = plf_p[ 7 ];
				// the next FOR is adapted to fill values in an array D starting at 0 and not at ADR = 1961+6 = 1967
				var iD = Array(2*iN);
				for( var j = 0; j<2*iN; j++) {
					iD[ j ] = plf_p[ j + 8 ];				
				};
				
				if( iNC < 0  ) break;
				// 402 CALL READ - NOT card read
				//     CALL WRITE - NOT card Write
				switch( i_p.length ) {
					case 6:
						outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ] );
						break;
					case 7:
						outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ], i_p[ 6 ] );
						break;
					default:
						outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ] );
						break;
				}
				
				// to REVISE
				// 	   IF(P(1).NE.1)GO TO 402 // read cards and write them as long they are not NOT cards							
			};
			
			// C ENTREE PAR SOUS PROGRAMME
			// 403
			iF = i_p[ 5 ]; // original : F = P(6)
			iN = iD1966; // original : N = D(1966)
			iFLAG = iD1965; // original : FLAG = D(1965)
			
			for( var j = 0; j < iN ; j++) {
				// original : iJJ = j + 1969; // not needed
				if( iFLAG >= 0 ) {
					i_p[ 5 ] = iF * iD[j]; // P(6)
				} else {
					i_p[ 5 ] = iF / iD[j]; // P(6)
				};
				var iJJJ= j + iN;
				i_p[ 2 ] = iD1967 * iD[iJJJ] + i_p[ 2 ];  // original : P(2) = D(1967) * D(iJJJ) + P(2)
				i_p[ 4 ] = i_p[ 4 ] * iD1968;  // original : P(5) = P(5) * D(1968)
				i_p[ 3 ] = i_p[ 3 ] - iD1969;  // original : P(4) = P(4) - D(1969)
				// CALL WRITE				
				/****************************************
				Added code:
				You can enter more "i" parameters: they will be added to the generated "i" command.
				*****************************************/
				if (i_p.length > 6) {
					pNOT = new Array( i_p.length - 6);
					for( var i = 0; i < pNOT.length; i++ ) pNOT[ i ] = i_p[ i + 6 ];
					
				// Here you can modify each of the added pNOT parameters.
				// pNOT[0], pNOT[1], pNOT[2], ...
					if (pNOT.length > 1) pNOT[1] = pNOT[1]+j; // An example
					
					}
				/****************************************
				End of Added Code
				*****************************************/
				switch( i_p.length ) {
					case 0:
					case 1:
					case 2:
					case 3:
					case 4:
					case 5:
						post( "PLF4 warning: to few parameters: ",i_p.length," in but 6 expected.\n" );
						break;
					case 6:
						/************************** "Original" Output ****************************************/
						outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ] );
						break;
					default:
						/************************** Added parameters Output****************************************/
						outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ], pNOT );
						break;
				}
			};
			
			// not needed
			iIC = iC + 1;
			if( (iIC - iNC) < 0 ) {
				// GOTO 402 
				};
			break;

			
		case 5:
 			/************************************************
			[Original comments: lines 00133 to 00152]
			****** PLF 5 for textures ct freq difference *******
			Use special insts
			Define harmonic structures in D array as follows
			Total Amplit reached, amplitude stored, pitch heard, ins no,
			Lowest frequ, incr1, incr2, 3, 4, 5
			1 harmonic structure takes 10 fields; it is thus referenced to by
			the addresss of the first field
			
			Call to PLF as follows
			PLF 0 5 NC ADRESS FREQ AMPL FUND INCR INS
             
			ADRESS  Adress of first field of wanted harmonic structure
			FREQ and following fields are defaulted
			FREQ    Defaulted for heard pitch - change it to actual heard pitch
			If you use FUND or INCR
			  AMP defaulted so that amplit specified on note card will be amplitude reached.
			FUND and INCR default value 1 Mult factor to change either lowest frequency only or all incrts only
			ins no default value specified in 4th field of struct def
			Define fields 1 to 6 of notes on dummy inst P5 and P6 will be changed so that they represent reached amplitude and heard pitch

             // Refs in the Lorrain 1980:
             // JEAN-CLAUDE RISSET - VOXN1: Inharmonique(VOXN1(1...3))
			************************************************/
			
			//* test coding -- not finished yet -- verificar bases zero ou um (k--)
			// 
			var PFNBR = plf_p.length;
			if( PFNBR < 10 ) {
				var K1 = PFNBR + 1;
				for( var k = K1; k<11; k++) plf_p[ k ] = 0;
			};
			var iIC = 0;
			var iNC = plf_p[ 3 ]; 	// original : NC = P(4) // Score = 8
			var iIADR = plf_p[ 4 ];	// original : IADR = P(5) // Score = 1080
			var iFREQ = plf_p[ 5 ]; // original : FREQ = P(6)  // Score = 0
			var iAMP = plf_p[ 6 ]; 	// original : AMP = P(7)  // Score = 0
			var iFUN = plf_p[ 7 ]; 	// original : FUN = P(8)  // Score = 0
			var iFIN = plf_p[ 8 ]; 	// original : FIN = P(9)  // Score = 0
			var iAINS = plf_p[ 9 ]; // original : AINS = P(10)  // Score = 0

			if( iFREQ == 0 ) iFREQ = structure[ iIADR ].frer; // D[ iADR + 2];  // SV1 = 506

			// Set amplitude factor: specidfied ampl/reached ampl
			if( iAMP == 0 ) iAMP = structure[ iIADR ].amp2 / structure[ iIADR ].amp1; // D[ iADR + 1] / D[ iADR ];

			// Set mult factor for lowest pitch
			if( iFUN == 0 ) iFUN = 1;
			// Set mult factor for all increments
			if( iFIN == 0 ) iFIN = 1;
			// Set inst no
			if( iAINS == 0 ) iAINS = structure[ iIADR ].i_num; // D[ iADR + 3];
			
			// original code repeated

			// 505 	CONTINUE	// Loop de leitura de NOTs
			//		CALL READ
			//if( i_p[ 0 ] != "i" ) break; // GOTO 1000 - error routine // if it's not a NOT
			
			i_p[ 4 ] = i_p[ 4 ] * iAMP; // P(5) = ...
			
			iFRE = i_p[ 5 ] / iFREQ ; // P(6)...
			i_p[ 5 ] = structure[ iIADR ].fund * iFRE * iFUN; // D[ iIADR + 4 ] // P(6) = ...
			i_p[ 1 ] = iAINS ; // P(3) = ..
			i_p[ 6 ] = 0 ; // P(7) = ..
			i_p[ 7 ] = 0 ; // P(8) = ..
			i_p[ 8 ] = 0 ; // P(9) = ..
			i_p[ 9 ] = structure[ iIADR ].comp[ 0 ] * iFRE * iFIN; // D[ iIADR + 5 ] * iFRE * iFIN; // P(10) = ...
			i_p[ 10 ] = structure[ iIADR ].comp[ 1 ] * iFRE * iFIN;  // D[ iIADR + 5 ] * iFRE * iFIN; // P(11) = ...
			i_p[ 11 ] = structure[ iIADR ].comp[ 2 ] * iFRE * iFIN;  // D[ iIADR + 6 ] * iFRE * iFIN; // P(12) = ...
			i_p[ 12 ] = structure[ iIADR ].comp[ 3 ] * iFRE * iFIN;  // D[ iIADR + 7 ] * iFRE * iFIN; // P(13) = ...
			i_p[ 13 ] = structure[ iIADR ].comp[ 4 ] * iFRE * iFIN; // D[ iIADR + 8 ] * iFRE * iFIN; // P(14) = ...
			
			PFNBR = 14;
			
			// CALL WRITE
			outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ], i_p[ 6 ], i_p[ 7 ], i_p[ 8 ], i_p[ 9 ], i_p[ 10 ], i_p[ 11 ], i_p[ 12 ], i_p[ 13 ]);

 			/* Set condition for main loop - not needed in this version */
			iIC = iIC + 1;
			if( (iIC - iNC) < 0 ) {
				// GOTO 505 Continue
			};
						
			break;
		
		case 6:
			/*****************************************************
			VERSION CROSSING RISSET'S PLF FORTRAN PROGRAMMING (JULY 77) AND LORAIN'S REPPORT (1980)
			
			// [used in Inharmonique sections IV, VI & VII]
			
			// Processing of P2 (instrument number according to invoked instrument)
			// instr 4101 will generate 4103 or 4104, 6101 -> 6103, 6104, etc.
			
			Structures defined in array D().
			Init by SV1 call
			ex.: SV1 0 1280 9 975 349 3 c1.f c1.d c1.a ...
			
			// example of call : PLF 0 6 1280 3]
			
			PLF 6 for inharmonic separate components
			
			if note duration zero the programm will assume durations given
			in data but multiplied by inverse frequency ratio
			e.g. if bell one octave higher, durations two times shorter
			call as follows:
			PLF 0 6 NC ADRESS
			with:
			NC number of following note cards on dummy instruments each defining a transp
			ADRESS adress in D array of begining of inharmonic sound specification
			
			************************************************/
			// [used in sections IV, VI & VII
			// example of call : PLF 0 6 1280 3]
			if(iverbose != 0) post("PLF ",ar_args[ 0 ]," [ ", plfRoutine[ ar_args[ 0 ] ].structure,", ", plfRoutine[ ar_args[ 0 ] ].active,"] in action: ",ar_args[ 1 ],"\n");
			var struct_num = plfRoutine[ ar_args[ 0 ] ].structure ;
			var iinstr_num = i_p[ 1 ];
			var iinstr_str = i_p[ 2 ];
			var iinstr_dur = i_p[ 3 ];
			var iinstr_amp = i_p[ 4 ];
			var iinstr_frq = i_p[ 5 ];
			
			var num_comp = structure[ plfRoutine[ ar_args[ 0 ] ].structure ].num_comp;
			// Instrument number destination 
			var i_num = structure[ plfRoutine[ ar_args[ 0 ] ].structure ].i_num;
			i_num = i_num + (iinstr_num - 1); // add instrument number 1 calling section
			var i_dur = 0;
			var i_amp = 0;
			var i_freq = 0;
			
			// Frequency ratio   instrFreq / structFreq
			var i_freqRatio = iinstr_frq / structure[ struct_num ].freq_sub;
			var i_ampRatio = iinstr_amp / structure[ struct_num ].amp_glb;
			var i_durRatio = iinstr_dur / structure[ struct_num ].comp[ 0 ].dur;
			
			
			/****************************************
			Added code:
			You can enter more "i" parameters: they will be added to the generated "i" command.
			*****************************************/
			var iNOTlength = i_p.length - 6;				
			if (i_p.length > 6) {
				// The pNOT array will hold the extra parameters
				pNOT = new Array( i_p.length - 6);
				for( var i = 0; i < pNOT.length; i++ ) {
					pNOT[ i ] = i_p[ i + 6 ];
				}
			// Here you can modify each of the added pNOT parameters.
			// pNOT[0], pNOT[1], pNOT[2], ...					
			}
			/****************************************
			End of Added Code
			*****************************************/
						
			for( var i = 0; i < num_comp; i++) {
				// 
				if( iinstr_dur == 0 ) {
					i_dur = structure[ struct_num ].comp[ i ].dur / i_freqRatio;
				} else {
					i_dur = structure[ struct_num ].comp[ i ].dur * i_durRatio / i_freqRatio;
				};
				// Amplitide ratio
				i_amp = structure[ struct_num ].comp[ i ].amp * i_ampRatio;
				// Frequency ratio
				i_freq = structure[ struct_num ].comp[ i ].freq * i_freqRatio;
								
				/****************************************
				Added code:
				You can enter modify the extra "i" parameters: they will be added to the generated "i" command.
				*****************************************/
				if (i_p.length > 6) {			
					// Here you can modify each of the added pNOT parameters.
					// pNOT[0], pNOT[1], pNOT[2], ...
					// Example: ADD 'i' component to p7 (second extra parameter:
					if (pNOT.length > 1) pNOT[ 1 ] = pNOT[ 1 ] + i; // this is just an example
					if (pNOT.length > 2) pNOT[ 2 ] = i; // another example: this overrides original parameter value
				}
				/****************************************
				End of Added Code
				*****************************************/
			
				switch( i_p.length ) {
					case 0:
					case 1:
					case 2:
					case 3:
					case 4:
					case 5:
						post( "PLF6 warning: to few parameters: ",i_p.length," in, but 6 expected.\n" );
						break;
					case 6:
						outlet(0, "toCsound", "event", "i", i_num, iinstr_str, i_dur, i_amp, i_freq );
						break;
					default:
						outlet(0, "toCsound", "event", "i", i_num, iinstr_str, i_dur, i_amp, i_freq, pNOT );
						break;
				}
	
			};
			
			break;
		case 66:
			/************************************************
			[Original comments:]
			PLF 6 for inharmonic separate components
			
			Define inharmonic sounds to be transposed by PLF as follow in D array
			Number of notes, total ampl reached, pitch geard, ins no, 
			Then for each note freq, dur, intensity
			specify in dummy inst notes the wanted AT, DUR, INT, PITCH
			if note duration zero the programm will assume durations given
			in data but multiplied by inverse frequency ratio
			e.g. if bell one octave higher, durations two times shorter
			call as follows:
			PLF 0 6 NC ADRESS FREQ AMPL DUR DURINC INSTNO
			with:
			NC		number of following note cards on dummy instruments each defining a transp
			ADRESS	adress in D array of begining of inharmonic sound specification
			FREQ	desired heard pitch in Hz  -- P(5)
			DUR		desired maximal duration    -- P(3)
			DURINC	additive incr for all durations
			INSTRNO	instrument number
			Analogous to PLF5 but different

			Note: different from Lorrain's PLF 6 Inharmonique description. Not tottally funcional: In progress.
			
			************************************************/
						
			var iC = 0; // NOT NEEDED
			// Data from PLF6 card
			var iNC = plf_p[ 3 ]; // original : NC = P(4)  // NOT NEEDED HERE
			var iIADR = plf_p[ 4 ]; // original : IADR = P(5)
			var iNN = structure[ iIADR ].num_comp; // D[ iIADR ] - 1

			var iFREQ = plf_p[ 5 ]; // original : FREQ = P(6)
			var iAMP = plf_p[ 6 ]; // original : AMP = P(7)
			var iDUR = plf_p[ 7 ]; // original : IADR = P(8)
			var iADUR = plf_p[ 8 ]; // original : DUR = P(9)
			var iAINS = plf_p[ 9 ]; // original : AINS = P(10)
			
			if(iverbose != 0) post("PLF 6 : NC: ",iNC," IADR: ",iIADR," NN: ",iNN," FREQ: ",iFREQ," AMP: ",iAMP," DUR: ",iDUR," ADUR: ",iADUR," AINS: ",iAINS);

			if( iFREQ == 0 ) iFREQ =  structure[ iIADR ].freq_sub; // d[ iADR + 2 ]
			// Ampl reached
			if( iAMP == 0 ) iAMP =  structure[ iIADR ].freq_sub; // d[ iADR + 1 ]
			// Durat mult factor
			if( iDUR == 0 ) iDUR =  structure[ iIADR ].comp[ 0 ].dur; // d[ iADR + 5 ]
			// Instrument number destination
			if( iAINS == 0 ) iAINS =  i_p[ 1 ]; // d[ iADR + 3 ]
			
			// CALL READ // read next NOT card - store P-values in i_p[]
			var iAM = i_p[ 4 ] / iAMP;
			
			// Ampl factor = ampl desired / ampl reached
			i_p[ 4 ] = structure[ iIADR ].comp[ 0 ].amp * iAM;
			
			// Frequency factor desired/reached
			var iinstr_frq = i_p[ 5 ];
			var iFRE =  i_p[ 5 ] / iFREQ;
			i_p[ 5 ] = iFRE * structure[ iIADR ].comp[ 0 ].freq; // D( iADR + 4 )
			
			i_p[ 1 ] = iAINS; // orig P(3)
			var iDDD = i_p[ 3 ];
			if( iDDD <= 0 ) {
				// if P3 Zero mpy durations by inverse freq ratio
				i_p[ 3 ] = iDUR / iFRE;
			} else {
				// if P3 Non-Zero factor DU desired/reached
				iDU = i_p[ 3 ] / iDUR;
				i_p[ 3 ] = iDUR / iFRE;
			};
			
			iPFNBR = 6;
			// CALL WRITE
			// writes the first card - structure(x).comp( 0 ) <---
			outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ]);
			
			
			for( var iII = 1; iII < iNN; iII++ ) { // MAYBE "<=" SHOULD BE "<"
				var iNNN = iIADR + 7 + 3 * (iII - 1); // comp iII-1 . freq
				
				if( iDDD <= 0 ) {
					// if P3 of note is Zero
					i_p[ 3 ] =  structure[ iIADR ].comp[ iII ].dur / iFRE + iADUR;
				} else {
					// otherwise					
					i_p[ 3 ] =  iDU * structure[ iIADR ].comp[ iII ].dur + iADUR;
				};
				i_p[ 4 ] =  iAM * structure[ iIADR ].comp[ iII ].amp;
				i_p[ 5 ] =  iFRE * structure[ iIADR ].comp[ iII ].freq;
				
								
				iPFNBR = 6;
				// CALL WRITE
				outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ] );
			};
			
			break;	
		case 7:
			/************************************************
			// Lorrain 1980: p6 Inharmonique(LBll13(1))
			P(4) - "le nombre d'énoncés NOT affectés, suivant imédiatement l'appel,"			
			P(5) - "le nombre d'énoncés NOT à ajouter pour chaque énoncé NOT donné,"
			P(6) - "un intervale de temps séparant les énoncés sucessifs ajoutés,
					à partir du 'temps d'action' des NOT donnés,"
			P(7) - "un décrement de durée des énoncés successifs ajoutés, par rapport
					à la durée des NOT données,"
			P(8) - "une valeur sélectionnant une option dans la PLF,"
			P(9) - "une valeur concernant les amplitudes ('gain')."
			
			************************************************/
			/************************************************
			[Original comments:]
			Pour repetitions, decalages, dvpts harmoniques
			PLF 0 7 NC N TS DD HARM GAIN
			NC 		Nb de cartes sur lesquelles PLF agit
			N		Nb de notes ajoutees
			TS		Separation temporelle
			DD		Diminution de duree d une note a la suiv
			HARM:	Zero repetition simple
					Negatif	Harmoniques catalogue
					Positif	Frequence incrementee par harm
					
			ATTENTION	Si GAIN nul amplitude pour notes y compris note
			initiale divisee par Nb composantes
			Si GAIN non nul composantes success multipl par GAIN
						
			************************************************/
			var iNC = plf_p[ 3 ]; 	// original : NC = P(4)
			var iN= plf_p[ 4 ];		// original : N = P(5)
			var iAN = iN + 1;       // for amplitude computing
			var iTS = plf_p[ 5 ]; 	// original : TS = P(6)
			var iDD = plf_p[ 6 ]; 	// original : DD = P(7)
			var iHARM = plf_p[ 7 ];	// original : HARM = P(8)
			var iGAIN = plf_p[ 8 ];	// original : GAIN = P(9)			
			var iFCT = iGAIN;

			var iG80 = plf_p[ 9 ];	// extra parameter to set variable g80
            // This variable, referenced in the Rapport as V80, belongs to instrument definition.
            // here for convenience is adapted as a P10
            // in the first two sections of LB1113
            // SV2 0 80 6.25 - means iG80 = 6.25
            // in the third section of LB1113
            // SV2 0 80 1 - means iG80 = 1.0

			// 
			// 	NOTs reading loop (DO 701 I=1, NC)
			//		CALL READ (for each NOT Card)
			
			iAM = i_p[ 4 ] / iAN;
			
			if( iGAIN != 0 ) {
				iFCT = iGAIN;
			} else {
				i_p[ 4 ] = i_p[ 4 ] / iAN; // P(5) = ...	
				iFCT = 1.0;
			} ;
			
			iAM = i_p[ 4 ];
			iF0 = i_p[ 5 ];
			i_p[ 6 ] = iG80;
			
			//		CALL WRITE
			outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ] );
			
			for( j = 1; j <= iN; j++ ) {
				if( iHARM < 0 ) i_p[ 5 ] = i_p[ 5 ] + iF0;
				if( iHARM >= 0 ) i_p[ 5 ] = i_p[ 5 ] + iHARM;
				i_p[ 4 ] = iAM * iFCT;
				i_p[ 3 ] = i_p[ 3 ] - iDD;
				i_p[ 2 ] = i_p[ 2 ] + iTS;
				i_p[ 6 ] = iG80;
				
				//		CALL WRITE
				outlet(0, "toCsound", "event", "i", i_p[ 1 ], i_p[ 2 ], i_p[ 3 ], i_p[ 4 ], i_p[ 5 ], i_p[ 6 ] );
			};
			break;
			
		default:
			//
			post("ERROR: PLF",ar_args[ 0 ], " is not defined.\n");
			break;		
	}
}

// =============================================================
function loadPLFdata( ) {
// =============================================================
    // Load SV1 data for use in PLF subroutines through texts loaded into coll data
	if(iverbose != 0) post("loadPLFdata: <",arguments[ 0 ],">  <",arguments[ 1 ],"> \n");
	switch( arguments[0] ) {
        case "plf":
            plfLoad = arguments[1];
            break;
		case "struct":
            structure[ arguments[1] ] = new Object();
             switch ( plfLoad ) {
                case 5:
                    structure.struct_plf5( arguments[1], arguments[2], arguments[3], arguments[4], arguments[5],arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11] );
                    break;
                case 6:
                    structure.struct_plf6( arguments[1], arguments[2], arguments[3], arguments[4], arguments[5] );
                    break;
            }
			break;
		case "comp":
            switch ( plfLoad ) {
                case 5:
                    break;
                case 6:
                    structure.struct_plf6_comp( arguments[1], arguments[2] , arguments[3], arguments[4], arguments[5] );
                    break;
            }
			break;
		case "eos":
            switch ( plfLoad ) {
                case 5:
                    break;
                case 6:
                    var struct_num = arguments[1];
                    for( var i in structure[ arguments[1] ].comp ) {
                        structure[ struct_num ].durMax = Math.max(structure[ struct_num ].comp[ i ].dur , structure[ struct_num ].durMax );
                    };
                    break;
            }
			break;
		default:
			post("ERROR: Unknown command: <",arguments[0],">\n");
			break;		
	}
}


// =============================================================
//                Data structures
// =============================================================
// =============================================================
function struct_plf5( ) {
// =============================================================
	/*	PLF 5 ======================================      Lorrain1980
	-    [0]    un numero de structure,
    -    [1]    deux paramètres concernant l'amplitude
    -    [2]    l'amplitude globale realisee par la structure telle que definie,
     -  [3]  la fréquence subjective
     [4] le numèro de l'instrumet devant exeécuter les énoncés 'NOT'
     [5] la "fondamentale" (fréquence de référence) de la structure
        cinq incréments de fréquence pour les cinq composantes de la structure
     [6] Incr 1
     [7] Incr 2
     [8] Incr 3
     [9] Incr 4
     [10] Incr 5

     SV1 0 1080 AMP1 AMP2 FRER INS FUND INC1 INC2 INC3 INC4 INC5 - see struct 1080
     PLF Card in Inharmonique
	 PLF 0 5 8 1080 0 0 0 0 0;	
	*/
	var ar_args = new Array;
	for(var i=0; i<arguments.length; i++ ) ar_args[ i ] = arguments[ i ];
	if(iverbose != 0) post("plf5 arguments: <",ar_args,">\n");
	
    //***********************************************************/
    // this = new Object();
    num_struct = ar_args[ 0 ];
    this[ num_struct ].amp1 = ar_args[ 1 ];
    this[ num_struct ].amp2 = ar_args[ 2 ];
    this[ num_struct ].frer = ar_args[ 3 ];
    this[ num_struct ].i_num = ar_args[ 4 ];
    this[ num_struct ].fund = ar_args[ 5 ];
    this[ num_struct ].comp = new Array( 5 );
    for( var j = 0; j<5; j++) {
        this[ num_struct ].comp[ j ] = ar_args[ j + 6 ];
    }
}


// =============================================================
function struct_plf6( num_struct, num_comp, amp_glb, freq_sub, i_num ) {
// =============================================================
	/* *************************************************** PLF 6
	-	[0]	un numero de structure, 
	-	[1]	le nombre de composantes de la structure, 
	-	[2]	l'amplitude globale realisee par la structure telle que definie, 
	-	[3]	la frequence subjective resultant de la structure,utilisee comme frequence de reference d'apres laquelle la structure sera transposee pour les enonces NOT affectes par la PLF6, 
	-	[4]	le numero de l'instrument devant realiser les composantes,
	-	trois donnees de reference pour chaque composante:
			frequence, 
			duree, 
			amplitude.
	***********************************************************/
	var ar_args = new Array;
	for(var i=0; i<arguments.length; i++ ) ar_args[ i ] = arguments[ i ];
	if(iverbose != 0) post("plf6 arguments: <",ar_args,">\n");
	// this = new Object();
	this[ num_struct ].num_comp = num_comp;
	this[ num_struct ].amp_glb = amp_glb;
	this[ num_struct ].freq_sub = freq_sub;
	this[ num_struct ].i_num = i_num;
	this[ num_struct ].comp = new Array( num_comp );
	this[ num_struct ].durMax = 0;
	
}
// =============================================================
function struct_plf6_comp( num_struct, c_num, freq, dur, amp ) {
// =============================================================
	this[ num_struct ].comp[ c_num ] = new Object();	
	this[ num_struct ].comp[ c_num ].freq = freq;
	this[ num_struct ].comp[ c_num ].dur = dur;
	this[ num_struct ].comp[ c_num ].amp = amp;
	
}
// =============================================================
function newRoutine( num_plf, num_events, num_struct ) {
// =============================================================
	this[ num_plf ] = new Object();
	this[ num_plf ].structure = num_struct;
	this[ num_plf ].active = num_events;	
}

// =============================================================
//                Data structure Information
// =============================================================
function infoStructure( num_struct ) {
// =============================================================
	post(">>> INFO on Structure <", num_struct ,">\n");
	for( var i in structure[ num_struct ] ) {
		if( i != "comp" ) {
			post(">>> prop <",i,"> = <",structure[ num_struct ][ i ],">\n");
		} else {
			for( var j in structure[ num_struct ][ i ] ) {
				post(">>> prop <",i,">.[",j,"] = <",structure[ num_struct ][ i ][ j ],">\n");
				for( var k in structure[ num_struct ][ i ][ j ] ) {
					post(">>> prop <",i,">.[",j,"] = <",k,"> = <",structure[ num_struct ][ i ][ j ][ k ],">\n");
				}
			}
		}
	};
}
// =============================================================
function infoStructureALL(  ) {
// =============================================================	
	for( var i in structure ) {
		post("============== INFO Structure <", i ,"> ==============\n");
		infoStructure( i );
	};
}
