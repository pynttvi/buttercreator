import * as React from 'react';
import {PropsWithChildren, useEffect, useState} from 'react';
import {styled, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar, {AppBarProps as MuiAppBarProps} from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import Grid from "@mui/material/Unstable_Grid2";
import {Accordion, AccordionDetails, AccordionSummary, Stack, TextField} from "@mui/material";
import {BackhgroundColor} from "@/app/theme";
import {NumberInput} from "@/app/components/numberInput";
import {ExpandMore} from "@mui/icons-material";
import {useReinc} from "@/app/contexts/reincContext";
import {roundAbilityTrained} from "@/app/filters/utils";
import useCheckMobileScreen from "@/app/components/useMobileScreen";


const Main = styled('div', {shouldForwardProp: (prop) => prop !== 'open'})<{
    open?: boolean;
    drawerWidth: number;
}>(({theme, open, drawerWidth}) => ({
    flexGrow: 1,
    padding: 0,
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
    }),
    /**
     * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
     * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
     * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
     * proper interaction with the underlying content.
     */
    position: 'relative',
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
    drawerWidth: number;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open, drawerWidth}) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: drawerWidth,
    }),
}));

const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'left',
    padding: theme.spacing(0, 0),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
    backgroundColor: BackhgroundColor
}));

const Content = styled(Grid)<{ drawerWidth: number }>(({theme, drawerWidth}) => ({
    padding: 0,
    textAlign: 'left',
    width: `calc(100% - ${drawerWidth}px)`,
    justifyContent: 'flex-start',
}));


const DrawerNumberInput = (props: PropsWithChildren<{
    value: number,
    onChange: (value: number | null) => void
}>) => {
    const StyledDrawerNumberInput = styled(NumberInput)(({theme}) => ({
        width: '40px', height: '40px'
    }));

    // @ts-ignore
    return <StyledDrawerNumberInput value={props.value} onChange={(_event, value: number) => props.onChange(value)}/>
}

const DrawerInputLabel = styled(Typography)(({theme}) => ({
    width: 300,
    variant: 'body1'
}));

const DrawerTextInput = (props: PropsWithChildren<{
    value: string,
    onChange: (event: InputEvent) => void
}>) => {
    const StyledDrawerTextInput = styled(TextField)(({theme}) => ({
        width: '40px', height: '40px'
    }));

    //@ts-ignore
    return <StyledDrawerTextInput value={props.value} onChange={(event: any) => {
        props.onChange(event);
    }}/>
}
const DrawerItem = styled(Stack)(({theme}) => ({
    alignItems: 'center',
    width: '100%'
}));

const NavigationItem = (props: PropsWithChildren<{ text: string, target: string }>) => {
    return (
        <Typography variant={'subtitle1'} onClick={() => {
            const element = document.getElementById(props.target);
            element && element.scrollIntoView({behavior: "smooth", block: "start"});
        }}>
            {props.text}
        </Typography>
    )
}

export default function PersistentDrawerRight(props: PropsWithChildren<{}>) {
    const {isMobileScreen, width: screenWidth} = useCheckMobileScreen()
    const drawerWidth = isMobileScreen ? screenWidth : 800

    const theme = useTheme();
    const reinc = useReinc()
    const {drawerOpen: open} = reinc

    const handleDrawerOpen = () => {
        reinc.setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        reinc.setDrawerOpen(false);
    };
    const [helpText, setHelpText] = useState(reinc.helpText)

    useEffect(() => {
        setHelpText(reinc.helpText)
    }, [reinc.helpText]);

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <AppBar drawerWidth={drawerWidth} position="fixed" open={open} sx={{backgroundColor: BackhgroundColor}}>
                <Toolbar sx={{backgroundColor: BackhgroundColor}}>
                    <Typography variant="h6" noWrap sx={{flexGrow: 1}} component="div">
                        <Stack direction={'row'} spacing={3}>
                            <NavigationItem target={'races-section'} text={"Races"}/>
                            <NavigationItem target={'guilds-section'} text={"Guilds"}/>
                            <NavigationItem target={'skills-section'} text={"Skills"}/>
                            <NavigationItem target={'spells-section'} text={"Spells"}/>
                            <NavigationItem target={'stats-section'} text={"Stats"}/>
                            <NavigationItem target={'wishes-section'} text={"Wishes"}/>
                            <NavigationItem target={'costs-section'} text={"Costs"}/>
                            <NavigationItem target={'training-section'} text={"Training"}/>
                        </Stack>
                    </Typography>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="end"
                        onClick={handleDrawerOpen}
                        sx={{...(open && {display: 'none'})}}
                    >
                        <MenuIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Grid direction={'row'} sx={{width: '100%'}}>
                <Main drawerWidth={drawerWidth} open={open}>

                    <DrawerHeader/>
                    {(!isMobileScreen || (!open && isMobileScreen)) && (
                        <Content drawerWidth={drawerWidth}>
                            {props.children}
                        </Content>
                    )}

                </Main>
                <Drawer
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                        },
                    }}
                    variant="persistent"
                    anchor="right"
                    open={open}
                >

                    <DrawerHeader sx={{backgroundColor: BackhgroundColor}}>
                        <IconButton onClick={handleDrawerClose}>
                            {theme.direction === 'rtl' ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
                        </IconButton>
                    </DrawerHeader>
                    <Divider/>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMore/>}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            Settings
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                <ListItem>
                                    <DrawerItem direction={'row'}>
                                        <DrawerInputLabel>Custom skillmax bonus</DrawerInputLabel>
                                        <DrawerNumberInput value={reinc.customSkillMaxBonus}
                                                           onChange={(value) => {
                                                               reinc.setCustomSkillMaxBonus(roundAbilityTrained(reinc.customSkillMaxBonus, value || 0))
                                                           }}
                                        />
                                    </DrawerItem>
                                </ListItem>
                                <ListItem>
                                    <DrawerItem direction={'row'}>
                                        <DrawerInputLabel>Custom spellmax bonus</DrawerInputLabel>
                                        <DrawerNumberInput value={reinc.customSpellMaxBonus}
                                                           onChange={(value) => {
                                                               reinc.setCustomSpellMaxBonus(roundAbilityTrained(reinc.customSpellMaxBonus, value || 0))
                                                           }}/>
                                    </DrawerItem>
                                </ListItem>
                                <ListItem>
                                    <DrawerItem direction={'row'}>
                                        <DrawerInputLabel>Copy-paste separator</DrawerInputLabel>
                                        <DrawerTextInput value={reinc.copyPasteSeparator}
                                                         onChange={(event: any) => {
                                                             reinc.setCopyPasteSeparator(event.target.value || "")
                                                         }}
                                        />
                                    </DrawerItem>
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>

                    <Divider/>
                    <pre>
                    {helpText}
                    </pre>

                </Drawer>
            </Grid>

        </Box>
    );
}